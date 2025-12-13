"use client";
import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function ImageViewer({ src, alt, className }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`cursor-pointer relative overflow-hidden ${className}`} onClick={() => setIsOpen(true)}>
        <Image src={src} alt={alt} fill className="object-cover hover:opacity-90 transition" unoptimized />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
          <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-3xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={src} alt={alt} fill className="object-contain" unoptimized />
          </div>
        </div>
      )}
    </>
  );
}