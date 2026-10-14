// Compress image file to base64 data URL to keep client storage & Firestore documents lightweight
export function readFileAsDataUrl(file: File, maxDimension: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawResult = event.target?.result as string;
      compressDataUrl(rawResult, maxDimension, 0.72)
        .then(resolve)
        .catch(() => resolve(rawResult));
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Compress an existing base64 data URL if it exceeds target size
export function compressDataUrl(
  dataUrl: string,
  maxDimension: number = 800,
  initialQuality: number = 0.72,
  maxBase64Length: number = 140000
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    // SVG data URLs are already tiny text vectors
    if (dataUrl.startsWith('data:image/svg+xml')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      let quality = initialQuality;
      let compressed = canvas.toDataURL('image/jpeg', quality);

      // Step down quality if still larger than maxBase64Length (~100KB)
      while (compressed.length > maxBase64Length && quality > 0.42) {
        quality = Math.max(0.4, quality - 0.12);
        compressed = canvas.toDataURL('image/jpeg', quality);
      }

      // If still large, scale canvas down once more
      if (compressed.length > maxBase64Length) {
        const scale = 0.75;
        canvas.width = Math.max(320, Math.round(width * scale));
        canvas.height = Math.max(240, Math.round(height * scale));
        const ctx2 = canvas.getContext('2d');
        if (ctx2) {
          ctx2.fillStyle = '#ffffff';
          ctx2.fillRect(0, 0, canvas.width, canvas.height);
          ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
          compressed = canvas.toDataURL('image/jpeg', 0.6);
        }
      }

      resolve(compressed);
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

export interface OptimizedImageResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  savedPercentage: number;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Read and optimize with detailed statistics for transparency
export async function readAndOptimizeImage(
  file: File,
  maxDimension: number = 800
): Promise<OptimizedImageResult> {
  const originalSize = file.size;
  const dataUrl = await readFileAsDataUrl(file, maxDimension);
  // Base64 string payload size in bytes estimation: length * 3/4
  const optimizedSize = Math.round((dataUrl.length * 3) / 4);
  const saved = originalSize > optimizedSize ? originalSize - optimizedSize : 0;
  const savedPercentage = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0;

  return {
    dataUrl,
    originalSize,
    optimizedSize,
    savedPercentage,
  };
}

