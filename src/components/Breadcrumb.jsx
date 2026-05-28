import React from 'react'
import { Link } from 'react-router-dom'

/**
 * items: Array<{ label: string, to?: string }>
 * آخرین آیتم بدون لینک (صفحه جاری)
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="مسیر صفحه" className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <React.Fragment key={idx}>
            {isLast ? (
              <span className="text-gray-800 font-medium truncate max-w-[180px]">{item.label}</span>
            ) : (
              <Link
                to={item.to || '/'}
                className="hover:text-primary transition-colors shrink-0"
              >
                {item.label}
              </Link>
            )}
            {!isLast && (
              <svg className="w-3.5 h-3.5 text-gray-300 shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
