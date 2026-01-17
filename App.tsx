import React, { useState, useEffect, useCallback } from 'react';
import { ImageFile, CompressionSettings, AnalysisResult } from './types';
import { compressImage } from './services/imageProcessor';
import { analyzeImageForSettings } from './services/geminiService';
import { DropZone } from './components/DropZone';
import { ImageItem } from './components/ImageItem';
import { SettingsPanel } from './components/SettingsPanel';
import { Image as ImageIcon, DownloadCloud, Zap, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 0.8,
    format: 'image/jpeg',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoTuning, setIsAutoTuning] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AnalysisResult | null>(null);

  const handleFilesDropped = (files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      status: 'pending'
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setAiSuggestion(null);
  };

  const processImages = useCallback(async () => {
    if (images.length === 0 || isProcessing) return;
    
    // Find images that need processing (pending) or reprocessing (if settings changed, we might want to flag them, 
    // but for now let's just process 'pending' ones or force all if triggered manually)
    // To keep it simple: We re-process everything that isn't currently processing
    
    setIsProcessing(true);

    const queue = images.map((img, index) => ({ img, index }));

    for (const { img, index } of queue) {
        // Update status to processing
        setImages(prev => {
            const next = [...prev];
            next[index] = { ...next[index], status: 'processing' };
            return next;
        });

        try {
            const blob = await compressImage(img.file, settings);
            
            setImages(prev => {
                const next = [...prev];
                // Check if image still exists in state
                if (next[index]) {
                    next[index] = {
                        ...next[index],
                        compressedBlob: blob,
                        compressedSize: blob.size,
                        status: 'done'
                    };
                }
                return next;
            });
        } catch (error) {
            console.error(error);
            setImages(prev => {
                const next = [...prev];
                if (next[index]) {
                    next[index] = { ...next[index], status: 'error', error: 'Failed to compress' };
                }
                return next;
            });
        }
    }

    setIsProcessing(false);
  }, [images, settings, isProcessing]);

  // Trigger processing when images are added or settings change
  // Note: In a real batch app, we might want a manual "Start" button, but "Reactive" is cooler.
  // However, avoid infinite loops. We only process 'pending' images automatically.
  // To re-process all on settings change, we need to mark them as pending.
  
  const handleSettingsChange = (newSettings: CompressionSettings) => {
    setSettings(newSettings);
    // Mark all as pending to re-process with new settings
    setImages(prev => prev.map(img => ({ ...img, status: 'pending' })));
  };

  // Effect to process pending images
  useEffect(() => {
    const pendingImages = images.filter(i => i.status === 'pending');
    if (pendingImages.length > 0 && !isProcessing) {
        const timeout = setTimeout(() => {
            processImages();
        }, 500); // Debounce slightly
        return () => clearTimeout(timeout);
    }
  }, [images, isProcessing, processImages]);

  const handleAutoTune = async () => {
    if (images.length === 0) return;
    
    setIsAutoTuning(true);
    // Analyze the first image as a sample
    const sampleImage = images[0].file;
    const result = await analyzeImageForSettings(sampleImage);
    
    setAiSuggestion(result);
    setSettings(prev => ({
        ...prev,
        format: result.suggestedFormat,
        quality: result.suggestedQuality
    }));
    
    // Reset all to pending to apply new AI settings
    setImages(prev => prev.map(img => ({ ...img, status: 'pending' })));
    setIsAutoTuning(false);
  };

  const handleDownloadAll = () => {
    images.forEach((img, index) => {
        if (img.status === 'done' && img.compressedBlob) {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(img.compressedBlob!);
                const ext = img.compressedBlob!.type.split('/')[1];
                const originalName = img.file.name.substring(0, img.file.name.lastIndexOf('.'));
                link.download = `${originalName}-min.${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 200); // Stagger downloads to prevent browser blocking
        }
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">ShrinkRay AI</h1>
                    <p className="text-xs text-slate-400">Intelligent Compression Tool</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</a>
                <div className="h-4 w-px bg-slate-700"></div>
                <span className="text-xs font-mono text-slate-500">v1.0.0</span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Dropzone & Settings */}
            <div className="lg:col-span-12 xl:col-span-12 space-y-8">
                
                {images.length === 0 ? (
                     <div className="max-w-3xl mx-auto">
                        <DropZone onFilesDropped={handleFilesDropped} />
                     </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SettingsPanel 
                            settings={settings} 
                            onSettingsChange={handleSettingsChange} 
                            onAutoTune={handleAutoTune}
                            isAutoTuning={isAutoTuning}
                            hasImages={images.length > 0}
                        />
                        
                        {aiSuggestion && (
                            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-purple-200">AI Optimization Applied</h4>
                                    <p className="text-sm text-purple-300/80 mt-1">{aiSuggestion.reasoning}</p>
                                    <div className="flex gap-3 mt-2 text-xs font-mono text-purple-400">
                                        <span className="bg-purple-500/20 px-2 py-1 rounded">Format: {aiSuggestion.suggestedFormat.split('/')[1].toUpperCase()}</span>
                                        <span className="bg-purple-500/20 px-2 py-1 rounded">Quality: {Math.round(aiSuggestion.suggestedQuality * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="lg:col-span-12 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                            Queue ({images.length})
                        </h2>
                        <div className="flex items-center gap-3">
                             <button 
                                onClick={clearAll}
                                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                            <button 
                                onClick={handleDownloadAll}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-all flex items-center gap-2"
                            >
                                <DownloadCloud className="w-4 h-4" />
                                Download All
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map(img => (
                            <ImageItem key={img.id} item={img} onRemove={removeImage} />
                        ))}
                        <DropZone onFilesDropped={handleFilesDropped} compact />
                    </div>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;