import React from 'react'

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="flex items-center gap-0 rounded-xl border border-gray-200 overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-bold"
        aria-label="کاهش تعداد"
      >
        −
      </button>
      <span className="w-12 h-10 flex items-center justify-center text-base font-bold text-gray-800 border-x border-gray-200 select-none">
        {String(value).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-bold"
        aria-label="افزایش تعداد"
      >
        +
      </button>
    </div>
  )
}
