import React from 'react';
import { CompressionSettings, ImageFormat, UpscaleMethod, AIResolution, TextCompressionMethod, FileCategory } from '../types';
import { Settings, Wand2, Info, Scaling, Minimize2, FileCode, Archive } from 'lucide-react';

interface SettingsPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (newSettings: CompressionSettings) => void;
  onAutoTune: () => void;
  isAutoTuning: boolean;
  hasImages: boolean;
  activeCategory: FileCategory;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  onAutoTune,
  isAutoTuning,
  hasImages,
  activeCategory
}) => {
  
  const handleChange = (key: keyof CompressionSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const renderImageSettings = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
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
        </div>

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
  );

  const renderTextSettings = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 block">Optimization Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                   onClick={() => handleChange('textMethod', 'minify')}
                   className={`p-3 rounded-lg border text-left transition-all ${
                     settings.textMethod === 'minify'
                     ? 'bg-blue-600/20 border-blue-500 text-white'
                     : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                   }`}
                >
                   <div className="font-medium text-sm flex items-center gap-2">
                     <FileCode className="w-4 h-4" /> Minify
                   </div>
                   <div className="text-xs opacity-70 mt-1">Remove whitespace & comments. Keeps file usable.</div>
                </button>
                <button
                   onClick={() => handleChange('textMethod', 'gzip')}
                   className={`p-3 rounded-lg border text-left transition-all ${
                     settings.textMethod === 'gzip'
                     ? 'bg-purple-600/20 border-purple-500 text-white'
                     : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                   }`}
                >
                   <div className="font-medium text-sm flex items-center gap-2">
                     <Archive className="w-4 h-4" /> Gzip
                   </div>
                   <div className="text-xs opacity-70 mt-1">Compress into .gz archive. Max reduction.</div>
                </button>
              </div>
          </div>
      </div>
  );

  const renderBinarySettings = () => (
      <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-in fade-in">
         <Archive className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
         <div>
            <h4 className="text-sm font-medium text-white">Gzip Compression</h4>
            <p className="text-xs text-slate-400 mt-1">
                Your PDF or binary file will be compressed using standard GZIP. 
                This reduces file size for storage or transfer. The output will be a <code>.gz</code> file.
            </p>
         </div>
      </div>
  );

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl space-y-6">
      
      {/* Mode Toggle Tabs */}
      <div className="flex p-1 bg-slate-900 rounded-lg">
        <button
          onClick={() => handleChange('mode', 'compress')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            settings.mode === 'compress' 
              ? 'bg-slate-700 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Minimize2 className="w-4 h-4" />
          Shrink / Optimize
        </button>
        <button
          onClick={() => handleChange('mode', 'upscale')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            settings.mode === 'upscale' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scaling className="w-4 h-4" />
          Resize & Upscale
        </button>
      </div>

      {settings.mode === 'compress' && (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
                {activeCategory === 'image' && 'Image Compression'}
                {activeCategory === 'text' && 'Code & Text Optimization'}
                {activeCategory === 'binary' && 'File Compression'}
            </h2>
            
            {activeCategory === 'image' && (
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
            )}
          </div>

          {activeCategory === 'image' && renderImageSettings()}
          {activeCategory === 'text' && renderTextSettings()}
          {activeCategory === 'binary' && renderBinarySettings()}
          
          {activeCategory === 'image' && (
             <div className="mt-4 flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  AI Auto-Tune analyzes the first image in your batch to suggest the optimal format and quality settings.
                </p>
             </div>
          )}
        </div>
      )}

      {settings.mode === 'upscale' && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
           {activeCategory !== 'image' ? (
               <div className="text-center py-10 text-slate-400">
                   <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                   <p>Upscaling is only available for images.</p>
                   <p className="text-xs mt-2">Switch to "Shrink / Optimize" for other files.</p>
               </div>
           ) : (
            <>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Upscale Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 block">Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                        onClick={() => handleChange('upscaleMethod', 'browser')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                            settings.upscaleMethod === 'browser'
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                        >
                        <div className="font-medium text-sm">Browser</div>
                        <div className="text-xs opacity-70 mt-1">Free & Unlimited</div>
                        </button>
                        <button
                        onClick={() => handleChange('upscaleMethod', 'ai')}
                        className={`p-3 rounded-lg border text-left transition-all ${
                            settings.upscaleMethod === 'ai'
                            ? 'bg-purple-600/20 border-purple-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                        >
                        <div className="font-medium text-sm flex items-center gap-1">
                            Gemini AI <Wand2 className="w-3 h-3" />
                        </div>
                        <div className="text-xs opacity-70 mt-1">Generative Detail</div>
                        </button>
                    </div>
                    </div>

                    <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 block">Target Resolution</label>
                    
                    {settings.upscaleMethod === 'browser' ? (
                        <div className="flex gap-2">
                        {[2, 4, 8].map(factor => (
                            <button
                            key={factor}
                            onClick={() => handleChange('upscaleFactor', factor)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                                settings.upscaleFactor === factor
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                            >
                            {factor}x
                            </button>
                        ))}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                        {(['2K', '4K'] as AIResolution[]).map(res => (
                            <button
                            key={res}
                            onClick={() => handleChange('aiResolution', res)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                                settings.aiResolution === res
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                            >
                            {res}
                            </button>
                        ))}
                        </div>
                    )}
                    </div>
                </div>
                
                <div className="mt-4 flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                    {settings.upscaleMethod === 'browser' 
                        ? "Uses high-quality bicubic interpolation. Good for increasing size, but does not add new detail. Instant and free."
                        : "Uses Gemini Pro Vision to reimagine the image at a higher resolution. Adds detail and clarity. Slower and consumes API quota."
                    }
                    </p>
                </div>
            </>
           )}
        </div>
      )}
    </div>
  );
};