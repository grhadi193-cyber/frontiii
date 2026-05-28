import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-black text-primary/20 mb-4">۴۰۴</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">صفحه پیدا نشد</h1>
      <p className="text-gray-500 mb-8">صفحه‌ای که دنبالش می‌گردید وجود ندارد یا حذف شده است.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
      >
        بازگشت به خانه
      </Link>
    </div>
  )
}
