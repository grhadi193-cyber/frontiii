import React, { useState } from 'react'

export default function ImageSlider({ images = [], alt = '' }) {
  const [current, setCurrent] = useState(0)

  // Fallback: اگر هیچ تصویری نداشت
  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-24 h-24 opacity-25" fill="none">
          <circle cx="40" cy="40" r="18" fill="#4F46E5" />
          <circle cx="40" cy="40" r="7" fill="white" />
          <circle cx="40" cy="40" r="3" fill="#F97316" />
          <path d="M40 10 L40 24 M40 56 L40 70 M10 40 L24 40 M56 40 L70 40"
            stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  return (
    <div className="flex flex-col gap-3">
      {/* تصویر اصلی */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-lg group">
        <img
          key={current}
          src={images[current]}
          alt={`${alt} - تصویر ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        {/* دکمه‌های ناوبری — فقط اگر بیش از یک تصویر */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="تصویر قبلی"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="تصویر بعدی"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* counter */}
            <div className="absolute bottom-3 left-3 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur">
              {String(current + 1).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}
              {' / '}
              {String(images.length).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}
            </div>
          </>
        )}
      </div>

      {/* thumbnails — فقط اگر بیش از یک تصویر */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === current
                  ? 'border-primary shadow-md shadow-primary/20 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
              }`}
              aria-label={`تصویر ${idx + 1}`}
            >
              <img
                src={src}
                alt={`${alt} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
