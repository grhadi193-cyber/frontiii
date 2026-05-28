import React from 'react'

export const STATUS_MAP = {
  pending:    { label: 'در انتظار تأیید',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  paid:       { label: 'تأیید شده',           color: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'در حال آماده‌سازی',  color: 'bg-orange-100 text-orange-700 border-orange-200' },
  shipped:    { label: 'تحویل به پست',        color: 'bg-purple-100 text-purple-700 border-purple-200' },
  delivered:  { label: 'تحویل شده',           color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:  { label: 'لغو شده',             color: 'bg-red-100 text-red-700 border-red-200' },
}

export default function OrderStatusBadge({ status, size = 'md' }) {
  const info = STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' }
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${info.color} ${sizeClass}`}>
      {info.label}
    </span>
  )
}
