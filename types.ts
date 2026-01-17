export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';
export type AppMode = 'compress' | 'upscale';
export type UpscaleMethod = 'browser' | 'ai';
export type AIResolution = '2K' | '4K';
export type FileCategory = 'image' | 'text' | 'binary';
export type TextCompressionMethod = 'minify' | 'gzip';

export interface CompressionSettings {
  mode: AppMode;
  // Image Settings
  quality: number; // 0.1 to 1.0
  format: ImageFormat;
  maxWidth?: number;
  maxHeight?: number;
  
  // Upscale Settings
  upscaleFactor: number;
  upscaleMethod: UpscaleMethod;
  aiResolution: AIResolution;

  // Text/File Settings
  textMethod: TextCompressionMethod;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string; // Blob URL for images, Icon placeholder for others
  category: FileCategory;
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
  processType?: AppMode;
  outputExtension?: string;
}

export interface AnalysisResult {
  suggestedFormat: ImageFormat;
  suggestedQuality: number;
  reasoning: string;
}

export interface User {
  username: string;
  email: string;
  isPro: boolean;
  verified: boolean;
}