import React from 'react';
import { Zap } from 'lucide-react';

export const Loader: React.FC<{ text?: string }> = ({ text = "Initializing Core..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        
        {/* Spinning Gradient Ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-l-purple-500 rounded-full animate-spin"></div>
        
        {/* Inner Pulse */}
        <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full animate-pulse flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Zap className="w-8 h-8 text-white fill-current" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-xl font-semibold text-white tracking-wide">{text}</h3>
        <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  );
};