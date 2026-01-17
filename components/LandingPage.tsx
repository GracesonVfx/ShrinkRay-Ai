import React from 'react';
import { Zap, Shield, Maximize, Cpu, ChevronRight, FileCheck, Layers } from 'lucide-react';

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
           <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
           </div>
           <span className="text-lg font-bold text-white tracking-tight">ShrinkRay AI</span>
        </div>
        <div className="flex items-center gap-6">
            <a href="#features" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            <button onClick={onStart} className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all border border-white/5">
                Log In
            </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative py-20">
        
        {/* Floating background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v2.0 Now Available with Gemini AI
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight max-w-4xl leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
          Optimize Everything. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
            Compromise Nothing.
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
          The all-in-one toolkit for modern developers. Compress images, minify code, 
          and upscale assets using next-generation AI. All running locally in your browser.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button 
                onClick={onStart}
                className="group relative px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
                Start Optimizing Free
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-600" />
            </button>
            <button className="px-8 py-4 bg-slate-800/50 text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 transition-all backdrop-blur-sm">
                View Documentation
            </button>
        </div>

        {/* Stats / Proof */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-slate-800 pt-8 animate-in fade-in delay-500">
            {[
                { label: 'Files Processed', value: '10M+' },
                { label: 'Bandwidth Saved', value: '500TB' },
                { label: 'AI Models', value: 'Gemini 3.0' },
                { label: 'Client Privacy', value: '100%' },
            ].map((stat, i) => (
                <div key={i}>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>
      </div>

      {/* Feature Grid Mini */}
      <div className="max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
            icon={Layers} 
            title="Batch Compression" 
            desc="Process hundreds of images at once with smart lossy algorithms that retain visual quality." 
        />
        <FeatureCard 
            icon={Maximize} 
            title="AI Upscaling" 
            desc="Turn low-res placeholders into 4K assets using Gemini Pro Vision generative fill." 
        />
        <FeatureCard 
            icon={Shield} 
            title="Local & Secure" 
            desc="Files never leave your device for basic compression. Total privacy by design." 
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: any, title: string, desc: string }> = ({ icon: Icon, title, desc }) => (
    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900/60 group">
        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
);