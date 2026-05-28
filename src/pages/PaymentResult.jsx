import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PaymentReceipt from '../components/PaymentReceipt.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { getOrder } from '../api/django.js'

// ── انیمیشن تیک موفق ──────────────────────────────────────────
function SuccessIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      <svg className="w-24 h-24" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="#22c55e"
          strokeWidth="5"
          strokeDasharray="289"
          strokeDashoffset="289"
          style={{ animation: 'drawCircle 0.6s ease forwards' }}
        />
        <polyline
          points="28,52 44,66 72,36"
          fill="none"
          stroke="#22c55e"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          strokeDashoffset="60"
          style={{ animation: 'drawCheck 0.4s 0.5s ease forwards' }}
        />
      </svg>
      <style>{`
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck  { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  )
}

function FailIcon() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      <svg className="w-24 h-24" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="#ef4444"
          strokeWidth="5"
          strokeDasharray="289"
          strokeDashoffset="289"
          style={{ animation: 'drawCircleRed 0.6s ease forwards' }}
        />
        <line x1="32" y1="32" x2="68" y2="68"
          stroke="#ef4444" strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="52" strokeDashoffset="52"
          style={{ animation: 'drawX 0.3s 0.5s ease forwards' }}
        />
        <line x1="68" y1="32" x2="32" y2="68"
          stroke="#ef4444" strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="52" strokeDashoffset="52"
          style={{ animation: 'drawX 0.3s 0.7s ease forwards' }}
        />
      </svg>
      <style>{`
        @keyframes drawCircleRed { to { stroke-dashoffset: 0; } }
        @keyframes drawX         { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  )
}

// ── تشخیص وضعیت از query params مختلف بک‌اند‌ها ──────────────────
function detectStatus(params) {
  // Django / custom backend
  const status = params.get('status')
  if (status === 'paid' || status === 'success' || status === 'successful') return 'paid'
  if (status === 'failed' || status === 'cancelled' || status === 'canceled') return 'failed'

  // پارامترهای رایج درگاه‌های ایرانی
  const Authority = params.get('Authority')
  const Status    = params.get('Status')
  if (Status === 'OK') return 'paid'
  if (Status === 'NOK') return 'failed'

  // سایر
  const success = params.get('success')
  if (success === 'true' || success === '1') return 'paid'
  if (success === 'false' || success === '0') return 'failed'

  const result = params.get('result')
  if (result === 'success' || result === 'ok') return 'paid'

  // اگه هیچ‌کدام نبود و اصلاً پارامتر نداشتیم، نشون بده که از کجا اومدی
  return null
}

function detectOrderId(params) {
  return params.get('order_id') || params.get('orderId') || params.get('order') || null
}

function detectTransactionId(params) {
  return params.get('transaction_id') || params.get('Authority') || params.get('ref_id') || params.get('refId') || null
}

export default function PaymentResult() {
  const [params]      = useSearchParams()
  const { token }     = useAuth()

  const detectedStatus  = detectStatus(params)
  const orderId         = detectOrderId(params)
  const transactionId   = detectTransactionId(params)

  // اگه status نبود ولی order_id بود، احتمالاً پرداخت موفق
  const isPaid = detectedStatus === 'paid' || (!detectedStatus && !!orderId)

  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchErr, setFetchErr] = useState('')

  useEffect(() => {
    if (isPaid && token && orderId) {
      setLoading(true)
      getOrder(token, orderId)
        .then(data => setOrder({ ...data, transaction_id: transactionId }))
        .catch(() => setFetchErr('خطا در بارگذاری جزئیات سفارش'))
        .finally(() => setLoading(false))
    }
  }, [isPaid, token, orderId])

  function handlePrint() { window.print() }

  // ── Success ──────────────────────────────────────────────────
  if (isPaid) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 print:hidden">
            <SuccessIcon />
            <h1 className="text-2xl font-bold text-green-600 mb-2">پرداخت موفق!</h1>
            <p className="text-gray-500 text-sm">
              سفارش شما با موفقیت ثبت شد. رسید خرید شما در زیر موجود است.
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="بارگذاری رسید..." />
            </div>
          )}

          {fetchErr && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-6">
              {fetchErr} — جزئیات سفارش در پروفایل شما موجود است.
            </div>
          )}

          {!loading && (
            <PaymentReceipt order={order || {
              transaction_id: transactionId,
              tracking_number: orderId,
              id: orderId,
            }} />
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              پرینت رسید
            </button>
            <Link
              to="/profile/orders"
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              مشاهده سفارشات من
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-bold rounded-xl transition-colors"
            >
              ادامه خرید
            </Link>
          </div>

          <style>{`
            @media print {
              body > *:not(#receipt-print) { display: none !important; }
              #receipt-print { display: block !important; }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // ── Failed or Unknown ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <FailIcon />
        <h1 className="text-2xl font-bold text-red-600 mb-3">پرداخت ناموفق</h1>
        <p className="text-gray-500 text-sm mb-2">
          متأسفانه پرداخت شما با موفقیت انجام نشد.
        </p>
        <p className="text-gray-400 text-xs mb-8 bg-gray-50 rounded-xl px-4 py-3">
          مبلغی از حساب شما کسر نشده است.
          در صورت هرگونه مشکل با پشتیبانی تماس بگیرید.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/checkout"
            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            تلاش مجدد
          </Link>
          <Link
            to="/cart"
            className="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            بازگشت به سبد خرید
          </Link>
        </div>
      </div>
    </div>
  )
}
