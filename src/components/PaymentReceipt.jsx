import React from 'react'

function toPersianNum(n) {
  return String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
}

function formatPrice(p) {
  return Number(p || 0).toLocaleString('fa-IR')
}

export default function PaymentReceipt({ order }) {
  if (!order) return null

  const items      = order.items || order.order_items || []
  const address    = order.shipping_address || {}
  const paidAt     = order.paid_at || order.created_at
  const shippingFee = Number(order.shipping_cost ?? 0)
  const total       = Number(order.total_price ?? order.total ?? 0)
  const itemsTotal  = total - shippingFee

  const dateStr = paidAt
    ? new Date(paidAt).toLocaleDateString('fa-IR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—'

  return (
    <div id="receipt-print" className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">

      {/* Header */}
      <div className="bg-gradient-to-l from-primary to-primary-dark px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">ATI Farzam Iranian</h2>
            <p className="text-primary-light text-sm mt-0.5">رسید خرید الکترونیک</p>
          </div>
          {/* Success badge */}
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60 text-xs mb-0.5">شماره سفارش</p>
            <p className="font-bold tracking-wide">{order.tracking_number || toPersianNum(order.id)}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-0.5">تاریخ پرداخت</p>
            <p className="font-bold">{dateStr}</p>
          </div>
          {order.transaction_id && (
            <div className="col-span-2">
              <p className="text-white/60 text-xs mb-0.5">شماره تراکنش</p>
              <p className="font-bold">{order.transaction_id}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="px-8 py-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">آیتم‌های سفارش</h3>
        <div className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.product_name || item.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatPrice(item.unit_price || item.price)} × {toPersianNum(item.quantity)} عدد
                </p>
              </div>
              <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                {formatPrice((item.unit_price || item.price) * item.quantity)} تومان
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>جمع کالاها</span>
            <span>{formatPrice(itemsTotal)} تومان</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>هزینه ارسال</span>
            <span>{shippingFee === 0 ? 'رایگان' : `${formatPrice(shippingFee)} تومان`}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>مجموع پرداختی</span>
            <span className="text-primary">{formatPrice(total)} تومان</span>
          </div>
        </div>
      </div>

      {/* Address */}
      {(address.street || address.full_address) && (
        <div className="px-8 pb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">آدرس تحویل</h3>
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 leading-relaxed">
            {address.province && `${address.province}، `}
            {address.city && `${address.city}، `}
            {address.street || address.full_address}
            {address.postal_code && (
              <span className="block text-xs text-gray-400 mt-1">
                کد پستی: {address.postal_code}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
