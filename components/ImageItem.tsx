import React from 'react';
import { ImageFile } from '../types';
import { Download, X, AlertCircle, Loader2, ArrowRight, FileText, FileCode, FileArchive, File as FileIcon } from 'lucide-react';
import { formatBytes } from '../services/imageProcessor';

interface ImageItemProps {
  item: ImageFile;
  onRemove: (id: string) => void;
}

export const ImageItem: React.FC<ImageItemProps> = ({ item, onRemove }) => {
  if (!item || !item.file) {
      return null;
  }

  // Calculate savings or increase
  let percentageChange = 0;
  let isIncrease = false;
  
  if (item.originalSize && item.compressedSize) {
      if (item.compressedSize < item.originalSize) {
          percentageChange = Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100);
      } else {
          percentageChange = Math.round(((item.compressedSize - item.originalSize) / item.originalSize) * 100);
          isIncrease = true;
      }
  }

  const handleDownload = () => {
    if (item.compressedBlob) {
      const url = URL.createObjectURL(item.compressedBlob);
      const link = document.createElement('a');
      link.href = url;
      
      let ext = 'jpg';
      if (item.outputExtension) {
          ext = item.outputExtension;
      } else {
        // Fallback
        if (item.compressedBlob.type === 'image/png') ext = 'png';
        if (item.compressedBlob.type === 'image/webp') ext = 'webp';
      }
      
      const originalName = item.file.name;
      // If we are adding an extension (like .gz), append it. Otherwise replace/insert.
      let downloadName = '';
      if (ext === 'gz') {
          downloadName = `${originalName}.gz`;
      } else {
         const namePart = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
         const suffix = item.processType === 'upscale' ? 'upscaled' : 'min';
         downloadName = `${namePart}-${suffix}.${ext}`;
      }

      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const renderPreview = () => {
      if (item.category === 'image') {
          return (
            <img 
            src={item.previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
          );
      }
      
      // Generic Icons
      const ext = item.file.name.split('.').pop()?.toLowerCase();
      let Icon = FileIcon;
      if (['js', 'ts', 'jsx', 'tsx', 'css', 'html', 'json'].includes(ext || '')) Icon = FileCode;
      else if (['txt', 'md', 'csv'].includes(ext || '')) Icon = FileText;
      else if (['zip', 'rar', '7z', 'gz', 'pdf'].includes(ext || '')) Icon = FileArchive;

      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50">
              <Icon className="w-12 h-12 text-slate-500 mb-2" />
              <span className="text-xs font-mono text-slate-500 uppercase">{ext}</span>
          </div>
      );
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all group">
      <div className="relative h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
        {renderPreview()}
        
        <button 
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Status Overlay */}
        {item.status === 'processing' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-2 text-sm font-medium text-white">Processing...</span>
          </div>
        )}
        
        {item.status === 'error' && (
          <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center backdrop-blur-sm">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
           <h4 className="text-sm font-medium text-slate-200 truncate max-w-[150px]" title={item.file.name}>
             {item.file.name}
           </h4>
           {item.status === 'done' && (
             <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isIncrease ? 'text-blue-400 bg-blue-400/10' : 'text-green-400 bg-green-400/10'}`}>
               {isIncrease ? '+' : '-'}{percentageChange}%
             </span>
           )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          <span>{formatBytes(item.originalSize)}</span>
          {item.compressedSize ? (
            <div className="flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-white font-medium">{formatBytes(item.compressedSize)}</span>
            </div>
          ) : (
            <span className="text-slate-600">...</span>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={item.status !== 'done'}
          className={`
            w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
            ${item.status === 'done'
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};