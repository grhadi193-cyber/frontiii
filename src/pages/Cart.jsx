import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import QuantitySelector from '../components/QuantitySelector.jsx'

function EmptyCart() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">سبد خرید شما خالی است</h2>
      <p className="text-gray-400 text-sm mb-8">
        هنوز محصولی به سبد خرید اضافه نکرده‌اید
      </p>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        ادامه خرید
      </Link>
    </div>
  )
}

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) return <EmptyCart />

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">سبد خرید</h1>
          <span className="text-sm text-gray-400">
            ({String(items.length).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])} محصول)
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Items list ── */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.product_id}
                item={item}
                onChangeQty={(qty) => updateQuantity(item.product_id, qty)}
                onRemove={() => removeItem(item.product_id)}
              />
            ))}
          </div>

          {/* ── Order summary ── */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-800 mb-5 pb-4 border-b border-gray-100">
                خلاصه سفارش
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">جمع محصولات</span>
                  <span className="font-semibold text-gray-800">
                    {totalPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">هزینه ارسال</span>
                  <span className="text-gray-400 text-xs leading-5">
                    بعد از انتخاب آدرس محاسبه می‌شود
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">جمع کل</span>
                  <span className="font-bold text-primary text-lg">
                    {totalPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                ادامه و تکمیل خرید
                <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-gray-400 hover:text-primary mt-4 transition-colors"
              >
                ادامه خرید
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function CartItem({ item, onChangeQty, onRemove }) {
  const rowTotal = item.price * item.quantity
  const stockMax = item.stock ?? 99

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
      {/* Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed">
            {item.name}
          </h3>
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
            aria-label="حذف از سبد"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <QuantitySelector
            value={item.quantity}
            onChange={onChangeQty}
            min={1}
            max={stockMax}
          />
          <div className="text-left">
            <p className="text-xs text-gray-400">
              {item.price.toLocaleString('fa-IR')} × {String(item.quantity).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}
            </p>
            <p className="text-base font-bold text-primary">
              {rowTotal.toLocaleString('fa-IR')} تومان
            </p>
          </div>
        </div>

        {item.quantity >= stockMax && (
          <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded-lg">
            حداکثر موجودی انتخاب شد
          </p>
        )}
      </div>
    </div>
  )
}
