import React, { useState } from 'react';
import { 
  IconFileText, 
  IconDownload, 
  IconCopy, 
  IconTrash, 
  IconChevronDown, 
  IconChevronUp,
  IconLoader2,
  IconCheck,
  IconAlertCircle
} from '@tabler/icons-react';
import { AudioItem, ProcessStatus } from '../types';

interface ResultCardProps {
  item: AudioItem;
  onRemove: (id: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ item, onRemove }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcription'>('summary');
  const [isExpanded, setIsExpanded] = useState(true);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.result?.transcription) return;

    const element = document.createElement("a");
    const file = new Blob([item.result.transcription], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    const downloadName = item.file.name.replace(/\.[^/.]+$/, "") + "_transcription.txt";
    element.download = downloadName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const content = activeTab === 'summary' ? item.result?.summary : item.result?.transcription;
    if(content) navigator.clipboard.writeText(content);
  };

  const isProcessing = item.status === ProcessStatus.PROCESSING;
  const isCompleted = item.status === ProcessStatus.COMPLETED;
  const isError = item.status === ProcessStatus.ERROR;
  const progressPercent = (item.currentChunk && item.totalChunks) 
    ? Math.round((item.currentChunk / item.totalChunks) * 100) 
    : 0;

  return (
    <div className="bg-gray-1 border border-gray-5 rounded-md shadow-light transition-all hover:shadow-strong overflow-hidden mb-2">
      
      {/* Card Header (RecordCard Style) */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => isCompleted && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Avatar / Icon Container */}
          <div className="h-8 w-8 rounded-sm bg-gray-3 border border-gray-5 flex items-center justify-center shrink-0 text-gray-9">
            <IconFileText size={16} />
          </div>

          <div className="flex flex-col min-w-0">
            <h4 className="text-md font-medium text-gray-12 truncate pr-4">
              {item.file.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-9">
              <span>{formatBytes(item.file.size)}</span>
              
              {/* Status Pill */}
              {isProcessing && (
                 <span className="flex items-center gap-1 px-2 h-4 rounded-pill bg-blue-3 text-blue font-medium text-xxs">
                    <IconLoader2 size={10} className="animate-spin" />
                    {item.totalChunks && item.totalChunks > 1 
                        ? `${progressPercent}%` 
                        : 'Processando'}
                 </span>
              )}
              {isCompleted && (
                 <span className="flex items-center gap-1 px-2 h-4 rounded-pill bg-green-3 text-green-9 font-medium text-xxs">
                    <IconCheck size={10} />
                    Concluído
                 </span>
              )}
              {isError && (
                 <span className="flex items-center gap-1 px-2 h-4 rounded-pill bg-red-3 text-red-9 font-medium text-xxs">
                    <IconAlertCircle size={10} />
                    Erro
                 </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isCompleted && (
            <>
              <button 
                onClick={handleDownload}
                className="h-8 w-8 flex items-center justify-center rounded-sm text-gray-9 hover:bg-gray-4 hover:text-gray-12 transition-colors"
                title="Download TXT"
              >
                <IconDownload size={16} />
              </button>
              <button 
                 onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                 className="h-8 w-8 flex items-center justify-center rounded-sm text-gray-9 hover:bg-gray-4 hover:text-gray-12 transition-colors"
              >
                {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </button>
            </>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
            className="h-8 w-8 flex items-center justify-center rounded-sm text-gray-9 hover:bg-red-3 hover:text-red-9 transition-colors"
            title="Remover"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      {/* Processing Bar */}
      {isProcessing && (
        <div className="w-full h-2 bg-gray-4 relative overflow-hidden">
          <div 
            className="h-full bg-blue transition-all duration-300 ease-linear rounded-r-sm"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      )}

      {/* Error Content */}
      {isError && (
        <div className="px-4 py-3 bg-red-3 border-t border-red-3 text-sm text-red-9">
          {item.error}
        </div>
      )}

      {/* Expanded Content */}
      {isCompleted && isExpanded && item.result && (
        <div className="border-t border-gray-5">
           {/* TabList */}
           <div className="flex gap-1 px-2 border-b border-gray-4 bg-gray-2">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTab('summary'); }}
                className={`
                   h-8 px-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-all duration-150
                   ${activeTab === 'summary' 
                     ? 'text-blue border-blue' 
                     : 'text-gray-9 border-transparent hover:text-gray-11'
                   }
                `}
              >
                Resumo
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTab('transcription'); }}
                className={`
                   h-8 px-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-all duration-150
                   ${activeTab === 'transcription' 
                     ? 'text-blue border-blue' 
                     : 'text-gray-9 border-transparent hover:text-gray-11'
                   }
                `}
              >
                Transcrição
              </button>
           </div>

           {/* Content Body */}
           <div className="p-4 bg-gray-1">
              <div className="relative">
                 {/* Copy Button Floating */}
                 <button 
                    onClick={handleCopy}
                    className="absolute top-0 right-0 z-10 h-6 px-2 flex items-center gap-1 bg-gray-1 border border-gray-6 rounded-sm text-xs font-medium text-gray-9 hover:bg-gray-3 hover:text-gray-12 shadow-sm"
                 >
                    <IconCopy size={12} />
                    Copiar
                 </button>

                 <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar text-md leading-6 text-gray-12 font-normal">
                    {activeTab === 'summary' ? (
                        <div className="whitespace-pre-wrap">
                            {item.result.summary}
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap font-mono text-sm text-gray-11 bg-gray-2 p-3 rounded-sm border border-gray-4">
                            {item.result.transcription}
                        </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};