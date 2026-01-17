export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
  format: ImageFormat;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

export interface AnalysisResult {
  suggestedFormat: ImageFormat;
  suggestedQuality: number;
  reasoning: string;
}