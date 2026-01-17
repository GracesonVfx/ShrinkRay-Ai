import React from 'react';
import { CompressionSettings, ImageFormat } from '../types';
import { Settings, Wand2, Info } from 'lucide-react';

interface SettingsPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (newSettings: CompressionSettings) => void;
  onAutoTune: () => void;
  isAutoTuning: boolean;
  hasImages: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  onAutoTune,
  isAutoTuning,
  hasImages
}) => {
  
  const handleChange = (key: keyof CompressionSettings, value: string | number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Global Settings</h2>
        </div>
        
        <button
          onClick={onAutoTune}
          disabled={isAutoTuning || !hasImages}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
            ${isAutoTuning 
               ? 'bg-purple-500/20 text-purple-300 cursor-wait animate-pulse' 
               : !hasImages
                 ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                 : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
            }
          `}
        >
          <Wand2 className={`w-4 h-4 ${isAutoTuning ? 'animate-spin' : ''}`} />
          {isAutoTuning ? 'Analyzing...' : 'AI Auto-Tune'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-300">Quality</label>
            <span className="text-sm font-mono text-blue-400">{Math.round(settings.quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.quality}
            onChange={(e) => handleChange('quality', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
             <span>Low</span>
             <span>High</span>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300 block">Output Format</label>
          <select
            value={settings.format}
            onChange={(e) => handleChange('format', e.target.value as ImageFormat)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="image/jpeg">JPEG (Best for photos)</option>
            <option value="image/png">PNG (Best for text/flat)</option>
            <option value="image/webp">WEBP (Modern/Efficient)</option>
          </select>
        </div>

        {/* Max Width */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300 block">Max Width (px)</label>
          <input
            type="number"
            placeholder="Original"
            value={settings.maxWidth || ''}
            onChange={(e) => handleChange('maxWidth', parseInt(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-slate-600"
          />
        </div>

        {/* Max Height */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300 block">Max Height (px)</label>
          <input
            type="number"
            placeholder="Original"
            value={settings.maxHeight || ''}
            onChange={(e) => handleChange('maxHeight', parseInt(e.target.value) || 0)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-slate-600"
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
         <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
         <p className="text-xs text-blue-200/80 leading-relaxed">
           AI Auto-Tune analyzes the first image in your batch to suggest the optimal format and quality settings for the entire set, balancing visual fidelity with file size reduction.
         </p>
      </div>
    </div>
  );
};