import React, { useState, useEffect, useCallback } from 'react';
import { Dropzone } from './Dropzone';
import { ResultCard } from './ResultCard';
import { AudioItem, ProcessStatus } from '../types';
import { processAudioWithGemini } from '../services/geminiService';
import { IconFolder, IconPlus } from '@tabler/icons-react';

export const TranscriberView: React.FC = () => {
  const [items, setItems] = useState<AudioItem[]>([]);

  const handleFilesAdded = useCallback((files: File[]) => {
    const newItems: AudioItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: ProcessStatus.IDLE,
      uploadProgress: 0,
      currentChunk: 0,
      totalChunks: 0,
    }));
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Processing Loop
  useEffect(() => {
    const processQueue = async () => {
      const idleItems = items.filter(item => item.status === ProcessStatus.IDLE);
      if (idleItems.length === 0) return;

      setItems(prev => prev.map(item => 
        item.status === ProcessStatus.IDLE ? { ...item, status: ProcessStatus.PROCESSING } : item
      ));

      idleItems.forEach(async (item) => {
        try {
          const result = await processAudioWithGemini(
            item.file,
            (current, total) => {
                setItems(prev => prev.map(prevItem => 
                    prevItem.id === item.id 
                    ? { ...prevItem, currentChunk: current, totalChunks: total } 
                    : prevItem
                ));
            }
          );
          setItems(prev => prev.map(prevItem => 
            prevItem.id === item.id ? { ...prevItem, status: ProcessStatus.COMPLETED, result } : prevItem
          ));
        } catch (error: any) {
          setItems(prev => prev.map(prevItem => 
            prevItem.id === item.id ? { ...prevItem, status: ProcessStatus.ERROR, error: error.message || 'Erro' } : prevItem
          ));
        }
      });
    };
    processQueue();
  }, [items]);

  return (
    <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-12">Biblioteca de Transcrição</h2>
        </header>

        {/* Upload Section */}
        <section>
            <Dropzone onFilesAdded={handleFilesAdded} />
        </section>

        {/* List Section */}
        <section className="flex flex-col gap-2">
            {items.length > 0 && (
                <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-medium text-gray-9 uppercase tracking-wide">
                        Recentes
                        </h2>
                        <button 
                        onClick={() => setItems([])} 
                        className="text-xs font-medium text-gray-9 hover:text-red-9 transition-colors"
                        >
                        Limpar
                        </button>
                </div>
            )}

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-5 rounded-md bg-gray-1">
                    <div className="h-10 w-10 rounded-full bg-gray-3 flex items-center justify-center mb-3">
                        <IconFolder size={20} className="text-gray-8" />
                    </div>
                    <p className="text-sm text-gray-11 font-medium">Nenhum áudio processado</p>
                    <p className="text-xs text-gray-9 mt-1">Seus arquivos aparecerão aqui</p>
                </div>
            ) : (
                items.map(item => (
                    <ResultCard 
                        key={item.id} 
                        item={item} 
                        onRemove={handleRemoveItem} 
                    />
                ))
            )}
        </section>
    </div>
  );
};