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

/**
 * Generate standardized filename for quality photos (e.g., 대한정공_증거사진_2401호선_20261022_123045_사진1.jpg)
 */
export function generatePhotoFilename(
  prefix: string = '증거사진',
  shipNo?: string,
  slotIdx?: number
): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const shipPart = shipNo && shipNo.trim() ? `${shipNo.trim()}호선_` : '';
  const slotPart = typeof slotIdx === 'number' ? `_사진${slotIdx + 1}` : '';
  return `대한정공_${prefix}_${shipPart}${yyyy}${mm}${dd}_${hh}${min}${ss}${slotPart}.jpg`;
}

/**
 * Saves/downloads an image file or base64 data URL directly to the user's mobile device or PC.
 * On mobile smartphones (Android / iOS), this triggers saving to the device's Downloads/Gallery folder.
 */
export function saveImageToDevice(
  fileOrDataUrl: File | Blob | string,
  suggestedFilename?: string
): boolean {
  try {
    let url: string;
    let isObjectUrl = false;

    if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      url = URL.createObjectURL(fileOrDataUrl);
      isObjectUrl = true;
    } else {
      url = fileOrDataUrl;
    }

    const filename = suggestedFilename || generatePhotoFilename();

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      if (isObjectUrl) {
        URL.revokeObjectURL(url);
      }
    }, 2000);

    return true;
  } catch (err) {
    console.error('Failed to save image to device:', err);
    return false;
  }
}

