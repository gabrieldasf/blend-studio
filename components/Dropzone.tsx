import React, { useCallback, useState } from 'react';
import { IconUpload, IconMusic, IconMovie, IconFile } from '@tabler/icons-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      const audioFiles = files.filter(file => 
        file.type.startsWith('audio/') || file.type.startsWith('video/')
      );
      if (audioFiles.length > 0) {
        onFilesAdded(audioFiles);
      }
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const audioFiles = Array.from(e.target.files);
        onFilesAdded(audioFiles);
    }
  }, [onFilesAdded]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden rounded-md border border-dashed transition-all duration-150 ease-in-out
        ${isDragging 
          ? 'border-blue bg-blue-3' 
          : 'border-gray-6 bg-gray-1 hover:bg-gray-2'
        }
        h-32 w-full cursor-pointer flex items-center justify-center group
      `}
    >
      <input
        type="file"
        multiple
        accept="audio/*,video/*"
        onChange={handleFileInput}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      
      <div className="flex flex-row items-center gap-4">
        <div className={`
          flex h-10 w-10 items-center justify-center rounded-md border
          ${isDragging 
            ? 'bg-blue-5 border-blue-7 text-blue' 
            : 'bg-gray-2 border-gray-5 text-gray-9 group-hover:text-gray-11'
          }
          transition-colors duration-150
        `}>
          <IconUpload size={20} stroke={2} />
        </div>
        
        <div className="text-left">
          <h3 className="text-sm font-medium text-gray-12">
            Clique ou arraste arquivos
          </h3>
          <p className="text-xs text-gray-9 mt-1">
            Suporta MP3, WAV, M4A, MP4 (Áudio)
          </p>
        </div>
      </div>
    </div>
  );
};