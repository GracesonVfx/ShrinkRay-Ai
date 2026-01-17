import React from 'react';
import { ImageFile } from '../types';
import { Download, X, AlertCircle, Check, Loader2, ArrowRight } from 'lucide-react';
import { formatBytes } from '../services/imageProcessor';

interface ImageItemProps {
  item: ImageFile;
  onRemove: (id: string) => void;
}

export const ImageItem: React.FC<ImageItemProps> = ({ item, onRemove }) => {
  const savings = item.originalSize && item.compressedSize
    ? Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)
    : 0;

  const handleDownload = () => {
    if (item.compressedBlob) {
      const url = URL.createObjectURL(item.compressedBlob);
      const link = document.createElement('a');
      link.href = url;
      // Determine extension based on blob type
      const ext = item.compressedBlob.type.split('/')[1];
      const originalName = item.file.name.substring(0, item.file.name.lastIndexOf('.'));
      link.download = `${originalName}-min.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all group">
      <div className="relative h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
        <img 
          src={item.previewUrl} 
          alt="Preview" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
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
             <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
               -{savings}%
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