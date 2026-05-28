import React from 'react'
import { STATUS_MAP } from './OrderStatusBadge.jsx'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const STATUS_ICONS = {
  pending: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  paid: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  processing: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  shipped: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l-3-3m3 3l3-3" />
    </svg>
  ),
  delivered: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  cancelled: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STATUS_COLORS = {
  pending:    'bg-yellow-500',
  paid:       'bg-blue-500',
  processing: 'bg-orange-500',
  shipped:    'bg-purple-500',
  delivered:  'bg-green-500',
  cancelled:  'bg-red-500',
}

export default function OrderTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">تاریخچه‌ای موجود نیست</p>
    )
  }

  return (
    <div className="relative">
      {history.map((entry, idx) => {
        const isLast = idx === history.length - 1
        const info = STATUS_MAP[entry.status] || { label: entry.status }
        const dotColor = STATUS_COLORS[entry.status] || 'bg-gray-400'
        const icon = STATUS_ICONS[entry.status] || null

        return (
          <div key={idx} className="flex gap-4 relative">
            {/* vertical line */}
            {!isLast && (
              <div className="absolute right-[18px] top-8 bottom-0 w-0.5 bg-gray-100" />
            )}

            {/* dot */}
            <div className={`relative z-10 w-9 h-9 rounded-full ${dotColor} flex items-center justify-center text-white flex-shrink-0 shadow-md mt-0.5`}>
              {icon}
            </div>

            {/* content */}
            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p className="font-semibold text-gray-800 text-sm">{info.label}</p>
              {entry.note && (
                <p className="text-gray-500 text-sm mt-0.5">{entry.note}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">{formatDate(entry.created_at || entry.timestamp)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
