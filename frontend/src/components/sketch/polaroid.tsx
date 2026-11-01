'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface PolaroidProps {
  imageSrc?: string;
  imageAlt?: string;
  caption: string;
  subcaption?: string;
  rotation?: number;
  tapeColor?: string;
  showHeart?: boolean;
  initialLikes?: number;
  children?: React.ReactNode;
  className?: string;
}

export function Polaroid({
  imageSrc,
  imageAlt = 'Polaroid capture',
  caption,
  subcaption,
  rotation = 1.5,
  tapeColor = 'rgba(255, 235, 0, 0.55)',
  showHeart = false,
  initialLikes = 13,
  children,
  className = '',
}: PolaroidProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!liked) {
      setLikes((prev) => prev + 1);
      setLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setLiked(false);
    }
  };

  return (
    <div
      className={`relative bg-[#FFFFFF] p-4 pb-6 border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] transition-all duration-200 ease-out hover:rotate-0 hover:-translate-y-1.5 hover:shadow-[7px_7px_0_#111111] rounded-[4px] select-none ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Translucent tape at top */}
      <div
        className="polaroid-tape"
        style={{
          backgroundColor: tapeColor,
        }}
        aria-hidden="true"
      />

      {/* Photo Frame / Content Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAFAF5] border-2 border-[#111111] rounded-[2px] flex items-center justify-center">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : children ? (
          children
        ) : (
          <div className="p-4 text-center">
            <span className="font-hand text-lg text-[#6B6B66]">Snapshot Preview</span>
          </div>
        )}
      </div>

      {/* Handwritten Caption Area (Thicker bottom area) */}
      <div className="mt-3 flex items-center justify-between px-1">
        <div>
          <p className="font-hand text-lg md:text-xl font-bold text-[#111111] leading-tight">
            {caption}
          </p>
          {subcaption && (
            <p className="font-mono text-[11px] text-[#6B6B66] tracking-wider mt-0.5">
              {subcaption}
            </p>
          )}
        </div>

        {showHeart && (
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded-full border border-[#111111] transition-colors ${
              liked
                ? 'bg-[#FFEB00] text-[#111111]'
                : 'bg-transparent text-[#6B6B66] hover:bg-slate-100'
            }`}
            title="Like this item"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-[#111111] text-[#111111]' : ''}`} />
            <span>{likes}</span>
          </button>
        )}
      </div>
    </div>
  );
}

