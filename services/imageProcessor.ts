import { CompressionSettings, ImageFormat } from '../types';

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const processImage = async (file: File, settings: CompressionSettings): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (settings.mode === 'compress') {
          if (settings.maxWidth || settings.maxHeight) {
            const maxWidth = settings.maxWidth || Infinity;
            const maxHeight = settings.maxHeight || Infinity;
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
          }
        } 
        else if (settings.mode === 'upscale' && settings.upscaleMethod === 'browser') {
           width = Math.round(width * settings.upscaleFactor);
           height = Math.round(height * settings.upscaleFactor);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context failed')); return; }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (settings.format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Blob creation failed')),
          settings.format,
          settings.quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const minifyText = async (file: File): Promise<Blob> => {
  const text = await file.text();
  let minified = text;

  if (file.type === 'application/json') {
      try {
          minified = JSON.stringify(JSON.parse(text));
      } catch (e) { /* Invalid JSON, return original */ }
  } else {
      // Basic whitespace remover for JS/CSS/HTML/TXT
      // This is a naive minifier but safe for general usage
      minified = text
          .replace(/\r\n/g, "\n")
          .replace(/\t/g, " ")
          .replace(/  +/g, " "); 
  }
  
  return new Blob([minified], { type: file.type });
};

const gzipFile = async (file: File): Promise<Blob> => {
    // Use native CompressionStream API
    const stream = file.stream();
    const compressedReadableStream = stream.pipeThrough(new CompressionStream("gzip"));
    const compressedResponse = await new Response(compressedReadableStream);
    const blob = await compressedResponse.blob();
    return blob;
};

export const processFile = async (file: File, settings: CompressionSettings): Promise<{ blob: Blob, extension?: string }> => {
    // 1. Image Processing
    if (file.type.startsWith('image/') && settings.mode !== 'compress') {
        // If upscaling, we treat as image always
         const blob = await processImage(file, settings);
         return { blob };
    }
    
    if (file.type.startsWith('image/') && settings.mode === 'compress') {
        const blob = await processImage(file, settings);
        return { blob };
    }

    // 2. Text Processing (Minify or Gzip)
    const isText = file.type === 'application/json' || 
                   file.type === 'text/plain' || 
                   file.type === 'text/css' || 
                   file.type === 'text/html' ||
                   file.type === 'text/javascript' ||
                   file.name.endsWith('.js') ||
                   file.name.endsWith('.ts');

    if (isText && settings.textMethod === 'minify') {
        const blob = await minifyText(file);
        return { blob };
    }

    // 3. Binary/PDF/Other or Text-Gzip Processing
    const blob = await gzipFile(file);
    return { blob, extension: 'gz' };
};