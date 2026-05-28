import React from 'react'

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  // ساخت آرایه صفحات قابل نمایش
  function getPages() {
    const pages = []
    const delta = 2
    const left  = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)

    if (left > 1) {
      pages.push(1)
      if (left > 2) pages.push('...')
    }
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const pages = getPages()

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      {/* قبلی */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        قبلی
      </button>

      {/* صفحات */}
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400 select-none">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
              p === page
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            {String(p).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])}
          </button>
        )
      )}

      {/* بعدی */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        بعدی
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  )
}
