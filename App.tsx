import React, { useState, useEffect, useCallback } from 'react';
import { Dropzone } from './components/Dropzone';
import { ResultCard } from './components/ResultCard';
import { AudioItem, ProcessStatus } from './types';
import { processAudioWithGemini } from './services/geminiService';
import { 
    IconMicrophone, 
    IconFolder, 
    IconSettings, 
    IconLayoutSidebarLeftCollapse,
    IconPlus,
    IconInfinity
} from '@tabler/icons-react';

const App: React.FC = () => {
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

  // Processing Loop (Same logic as before)
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
    <div className="flex h-screen w-full bg-gray-2 text-gray-12 font-sans overflow-hidden">
      
      {/* Navigation Drawer (Sidebar) */}
      <aside className="w-60 bg-gray-2 border-r border-gray-6 flex flex-col hidden md:flex">
        {/* Sidebar Header */}
        <div className="h-14 px-3 flex items-center gap-2 border-b border-gray-4">
            <div className="h-6 w-6 rounded-sm bg-blue text-white flex items-center justify-center">
                <IconMicrophone size={16} stroke={2.5} />
            </div>
            <span className="font-semibold text-sm text-gray-12 tracking-tight">Blend Studio</span>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 p-2 space-y-0.5">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-gray-4 text-gray-12 font-medium text-sm cursor-pointer">
                <IconFolder size={16} className="text-gray-11" />
                <span>Biblioteca</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-gray-9 hover:bg-gray-3 hover:text-gray-12 font-medium text-sm cursor-pointer transition-colors">
                <IconSettings size={16} className="text-gray-9" />
                <span>Configurações</span>
            </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-4">
            <a href="https://blendtc.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-gray-9 hover:text-blue transition-colors">
                <IconInfinity size={16} />
                <span>Powered by Blend</span>
            </a>
        </div>
      </aside>

      {/* Default Layout Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-2">
        
        {/* Page Header */}
        <header className="h-14 px-4 md:px-6 flex items-center justify-between bg-gray-1 border-b border-gray-4 shrink-0">
            <div className="flex items-center gap-3">
                <button className="md:hidden p-1 text-gray-9">
                    <IconLayoutSidebarLeftCollapse size={20} />
                </button>
                <h1 className="text-md font-medium text-gray-12">Meus Arquivos</h1>
            </div>

            <div className="flex items-center gap-2">
                 <button 
                    onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                    className="h-8 px-3 flex items-center gap-1.5 bg-blue text-white text-sm font-medium rounded-sm hover:bg-blue-10 transition-colors shadow-sm"
                 >
                    <IconPlus size={16} stroke={2.5} />
                    <span>Novo Upload</span>
                 </button>
            </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                
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
        </main>
      </div>
    </div>
  );
};

export default App;