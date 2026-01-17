import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Plus } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesDropped, compact }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesDropped(validFiles);
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      onFilesDropped(validFiles);
    }
    // Reset value so same files can be selected again if needed
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  if (compact) {
    return (
      <div 
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800'
          }
        `}
      >
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleInputChange}
        />
        <Plus className="w-6 h-6 text-slate-400 mb-1" />
        <span className="text-sm text-slate-400 font-medium">Add more</span>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        min-h-[300px]
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
          : 'border-slate-700 hover:border-blue-400/50 bg-slate-800/30 hover:bg-slate-800/50'
        }
      `}
    >
      <input 
        ref={inputRef}
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        onChange={handleInputChange}
      />
      
      <div className={`
        p-4 rounded-full bg-slate-800 mb-4 transition-transform duration-300
        ${isDragging ? 'scale-110 bg-blue-500/20' : ''}
      `}>
        {isDragging ? (
           <Upload className="w-10 h-10 text-blue-400" />
        ) : (
           <ImageIcon className="w-10 h-10 text-slate-400" />
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-slate-200 mb-2">
        {isDragging ? 'Drop images here' : 'Drag & Drop your images'}
      </h3>
      <p className="text-slate-400 text-center max-w-sm">
        Support for JPEG, PNG, WEBP. <br/>
        Batch processing supported.
      </p>
    </div>
  );
};