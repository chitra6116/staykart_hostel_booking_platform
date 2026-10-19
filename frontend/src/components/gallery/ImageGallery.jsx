import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Image as ImageIcon } from 'lucide-react';

export default function ImageGallery({ images = [], title = 'Stay' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (index) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
        <ImageIcon className="w-12 h-12 mb-2" />
        <p className="text-sm font-medium">{title}</p>
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];
  const isCurrentFailed = failedImages[selectedIndex];

  return (
    <div className="space-y-3">
      {/* Main Image Frame */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 group shadow-md">
        {isCurrentFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-teal-900/30 text-teal-200 p-6 text-center">
            <ImageIcon className="w-16 h-16 mb-2 text-teal-400" />
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-xs text-teal-300/70 mt-1">Photo preview temporarily unavailable</p>
          </div>
        ) : (
          <img
            src={currentImage.largeUrl || currentImage.cardUrl || currentImage.thumbnailUrl}
            alt={currentImage.altText || `${title} photo ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
            onError={() => handleImageError(selectedIndex)}
            loading="eager"
          />
        )}

        {/* View Fullscreen Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-900/90 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md"
          aria-label="Open fullscreen photo gallery"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>View Gallery ({selectedIndex + 1}/{images.length})</span>
        </button>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[4/3] w-20 sm:w-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? 'border-teal-500 scale-95 shadow-sm'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.thumbnailUrl || img.cardUrl}
                alt={img.altText || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-fade-in">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div>
              <p className="font-semibold text-sm sm:text-base">{title}</p>
              <p className="text-xs text-slate-400">
                {currentImage.altText || `Photo ${selectedIndex + 1} of ${images.length}`}
              </p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close photo lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Image with Nav Arrows */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6">
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={currentImage.largeUrl || currentImage.cardUrl}
              alt={currentImage.altText || `${title} photo ${selectedIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnails */}
          <div className="flex justify-center gap-2 overflow-x-auto py-2 z-10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-[4/3] w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === idx ? 'border-teal-400 scale-105' : 'border-transparent opacity-50'
                }`}
              >
                <img
                  src={img.thumbnailUrl || img.cardUrl}
                  alt={img.altText || `Thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
