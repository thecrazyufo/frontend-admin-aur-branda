import { useState } from "react";

export interface ProductScreenshot {
  url: string;
  alt: string;
  caption?: string;
}

interface ProductGalleryProps {
  screenshots: ProductScreenshot[];
  productName: string;
}

export default function ProductGallery({ screenshots = [], productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-12 flex items-center justify-center min-h-72">
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
            <p className="font-bold text-gray-900 text-lg">{productName}</p>
            <p className="text-sm text-gray-500 mt-1">Product Visual</p>
          </div>
        </div>
      </div>
    );
  }

  const activeShot = screenshots[activeIndex];

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Main Image Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 shadow-lg bg-zinc-50 aspect-video flex items-center justify-center group">
        <img 
          src={activeShot.url} 
          alt={activeShot.alt || `${productName} screenshot`} 
          className="w-full h-full object-contain transition-all duration-500 hover:scale-105"
        />
        {activeShot.caption && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
            <p className="text-white text-sm font-medium">{activeShot.caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {screenshots.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1 snap-x">
          {screenshots.map((shot, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                activeIndex === idx 
                  ? "border-blue-500 shadow-md ring-2 ring-blue-500/20 ring-offset-1" 
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-zinc-300"
              }`}
            >
              <img 
                src={shot.url} 
                alt={shot.alt || `Thumbnail ${idx + 1}`} 
                className="w-full h-full object-cover bg-zinc-100"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
