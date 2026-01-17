import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ImageFile, CompressionSettings, AnalysisResult, FileCategory, User } from './types';
import { processFile } from './services/imageProcessor';
import { analyzeImageForSettings, upscaleImageWithAI } from './services/geminiService';
import { DropZone } from './components/DropZone';
import { ImageItem } from './components/ImageItem';
import { SettingsPanel } from './components/SettingsPanel';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Loader } from './components/Loader';
import { Image as ImageIcon, DownloadCloud, Zap, Trash2, Files, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

type ViewState = 'landing' | 'auth' | 'app';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [showLoader, setShowLoader] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // App Logic State
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>({
    mode: 'compress',
    quality: 0.8,
    format: 'image/jpeg',
    upscaleFactor: 2,
    upscaleMethod: 'browser',
    aiResolution: '2K',
    textMethod: 'minify'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoTuning, setIsAutoTuning] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AnalysisResult | null>(null);

  // --- View Management ---

  const handleStart = () => {
    setCurrentView('auth');
  };

  const handleLogin = (userData: User) => {
    // Transition from Auth to App with a loader
    setUser(userData);
    setShowLoader(true);
    setCurrentView('app'); // Mount app but cover with loader
    setTimeout(() => {
        setShowLoader(false);
    }, 2000); // Simulate boot up time
  };

  const handleLogout = () => {
      setImages([]);
      setUser(null);
      setCurrentView('landing');
  };

  // --- Core App Logic (Same as before) ---

  const getCategory = (file: File): FileCategory => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/json' || 
        file.type.startsWith('text/') || 
        file.name.endsWith('.js') || 
        file.name.endsWith('.ts') ||
        file.name.endsWith('.md')) return 'text';
    return 'binary';
  };

  const activeCategory = useMemo(() => {
      if (images.length === 0) return 'image';
      return images[0].category;
  }, [images]);

  const handleFilesDropped = (files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      category: getCategory(file),
      originalSize: file.size,
      status: 'pending'
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img && img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => { if(img.previewUrl) URL.revokeObjectURL(img.previewUrl); });
    setImages([]);
    setAiSuggestion(null);
  };

  const processImages = useCallback(async () => {
    if (images.length === 0 || isProcessing) return;

    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) return;
    
    setIsProcessing(true);

    for (const img of pendingImages) {
        setImages(prev => prev.map(i => 
            i.id === img.id ? { ...i, status: 'processing' } : i
        ));

        try {
            if (!img.file) throw new Error("File not found");

            let blob: Blob;
            let ext: string | undefined = undefined;

            if (img.category === 'image' && settings.mode === 'upscale' && settings.upscaleMethod === 'ai') {
                blob = await upscaleImageWithAI(img.file, settings.aiResolution);
            } else {
                const result = await processFile(img.file, settings);
                blob = result.blob;
                ext = result.extension;
            }
            
            setImages(prev => prev.map(i => 
                i.id === img.id ? {
                    ...i,
                    compressedBlob: blob,
                    compressedSize: blob.size,
                    status: 'done',
                    processType: settings.mode,
                    outputExtension: ext
                } : i
            ));
        } catch (error) {
            console.error("Processing error:", error);
            setImages(prev => prev.map(i => 
                i.id === img.id ? { ...i, status: 'error', error: 'Failed to process' } : i
            ));
        }
    }

    setIsProcessing(false);
  }, [images, settings, isProcessing]);

  const handleSettingsChange = (newSettings: CompressionSettings) => {
    setSettings(newSettings);
    setImages(prev => prev.map(img => ({ ...img, status: 'pending' })));
  };

  useEffect(() => {
    const pendingImages = images.filter(i => i.status === 'pending');
    if (pendingImages.length > 0 && !isProcessing) {
        const timeout = setTimeout(() => {
            processImages();
        }, 500); 
        return () => clearTimeout(timeout);
    }
  }, [images, isProcessing, processImages]);

  const handleAutoTune = async () => {
    if (images.length === 0 || activeCategory !== 'image') return;
    setIsAutoTuning(true);
    const sampleImage = images[0].file;
    if (!sampleImage) { setIsAutoTuning(false); return; }
    const result = await analyzeImageForSettings(sampleImage);
    setAiSuggestion(result);
    setSettings(prev => ({
        ...prev,
        mode: 'compress',
        format: result.suggestedFormat,
        quality: result.suggestedQuality
    }));
    setImages(prev => prev.map(img => ({ ...img, status: 'pending' })));
    setIsAutoTuning(false);
  };

  const handleDownloadAll = () => {
    images.forEach((img, index) => {
        if (img.status === 'done' && img.compressedBlob && img.file) {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(img.compressedBlob!);
                let ext = 'jpg';
                if (img.outputExtension) ext = img.outputExtension;
                else if (img.compressedBlob!.type === 'image/png') ext = 'png';
                else if (img.compressedBlob!.type === 'image/webp') ext = 'webp';
                const originalName = img.file.name;
                let downloadName = '';
                if (ext === 'gz') {
                    downloadName = `${originalName}.gz`;
                } else {
                    const namePart = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
                    const suffix = img.processType === 'upscale' ? 'upscaled' : 'min';
                    downloadName = `${namePart}-${suffix}.${ext}`;
                }
                link.download = downloadName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 200);
        }
    });
  };

  // --- Render ---

  if (currentView === 'landing') {
      return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen pb-20 relative">
      
      {currentView === 'auth' && (
          <AuthModal onLogin={handleLogin} />
      )}

      {showLoader && (
          <Loader text="Authenticating & Loading Workspace..." />
      )}

      {/* Main App Header */}
      <header className="glass-panel sticky top-0 z-40 border-b-0 border-b-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-purple-900/20">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">ShrinkRay AI</h1>
                    <p className="text-xs text-slate-400 font-medium">Pro Workspace</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {user && (
                    <div className="hidden md:flex items-center gap-3 bg-slate-800/50 py-1.5 px-3 rounded-full border border-slate-700">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-slate-900 relative">
                            {user.username.substring(0, 2).toUpperCase()}
                            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border border-slate-900">
                                <ShieldCheck className="w-2 h-2 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-200 font-medium leading-none">{user.username}</span>
                            <span className="text-[10px] text-blue-400 leading-none mt-1">Verified Account</span>
                        </div>
                    </div>
                )}
                <div className="h-6 w-px bg-slate-700"></div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`max-w-7xl mx-auto px-6 py-10 space-y-8 transition-opacity duration-500 ${currentView === 'auth' || showLoader ? 'opacity-0' : 'opacity-100'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 xl:col-span-12 space-y-8">
                {images.length === 0 ? (
                     <div className="max-w-4xl mx-auto">
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
                            activeCategory={activeCategory}
                        />
                        
                        {aiSuggestion && settings.mode === 'compress' && activeCategory === 'image' && (
                            <div className="mt-4 p-4 glass-card rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border-l-4 border-l-purple-500">
                                <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-purple-200">AI Optimization Applied</h4>
                                    <p className="text-sm text-purple-300/80 mt-1">{aiSuggestion.reasoning}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center justify-between glass-panel p-4 rounded-xl">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Files className="w-5 h-5 text-blue-400" />
                            File Queue ({images.length})
                        </h2>
                        <div className="flex items-center gap-3">
                             <button 
                                onClick={clearAll}
                                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2 font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear
                            </button>
                            <button 
                                onClick={handleDownloadAll}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
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