import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title = '사진 원본 확대',
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [zoom, setZoom] = React.useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.min(z + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.max(z - 0.5, 1));
  };

  return (
    <div
      id="lightbox-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 select-none"
    >
      {/* Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl flex items-center justify-between text-white pb-3 border-b border-white/15"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm tracking-wide text-slate-200">
            {title} ({currentIndex + 1} / {images.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="lightbox-zoom-out-btn"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
            title="축소"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs text-slate-300 w-10 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            id="lightbox-zoom-in-btn"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 disabled:opacity-40 transition-colors"
            title="확대"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            id="lightbox-close-btn"
            onClick={onClose}
            className="p-1.5 ml-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
            title="닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl flex-1 flex items-center justify-center overflow-hidden py-4"
      >
        {images.length > 1 && (
          <button
            type="button"
            id="lightbox-prev-btn"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95"
            aria-label="이전 사진"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="max-w-full max-h-full overflow-auto flex items-center justify-center p-2">
          <img
            src={currentImage}
            alt={`사진 확대 ${currentIndex + 1}`}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            className="max-h-[75vh] max-w-full object-contain rounded shadow-2xl transition-transform duration-200"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            id="lightbox-next-btn"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95"
            aria-label="다음 사진"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip if multiple */}
      {images.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex gap-2 pt-2 pb-1 overflow-x-auto max-w-full"
        >
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCurrentIndex(i);
                setZoom(1);
              }}
              className={`relative w-14 h-14 rounded overflow-hidden border-2 transition-all ${
                i === currentIndex
                  ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30'
                  : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`미리보기 ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
