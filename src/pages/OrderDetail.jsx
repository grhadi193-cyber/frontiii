import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProfileLayout from '../components/ProfileLayout.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import OrderTimeline from '../components/OrderTimeline.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ToastContainer, { useToast } from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getOrder, cancelOrder } from '../api/django.js'

function formatPrice(num) {
  if (num == null) return '—'
  return Number(num).toLocaleString('fa-IR') + ' تومان'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function OrderDetail() {
  const { id }         = useParams()
  const { token }      = useAuth()
  const navigate       = useNavigate()
  const { toasts, showToast } = useToast()

  const [order, setOrder]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!token || !id) return
    setLoading(true)
    getOrder(token, id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, id])

  async function handleCancel() {
    setCancelling(true)
    try {
      await cancelOrder(token, id)
      setOrder((prev) => ({ ...prev, status: 'cancelled' }))
      showToast('سفارش با موفقیت لغو شد', 'success')
      setShowConfirm(false)
    } catch (err) {
      showToast(err.message || 'خطا در لغو سفارش', 'error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <ProfileLayout>
      <ToastContainer toasts={toasts} />

      {/* confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">لغو سفارش</h3>
            <p className="text-gray-500 text-sm mb-6">
              آیا از لغو این سفارش مطمئن هستید؟ این عملیات قابل بازگشت نیست.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelling && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                )}
                {cancelling ? 'در حال لغو...' : 'بله، لغو شود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600 text-sm">
          <p className="font-medium mb-2">خطا در دریافت اطلاعات</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && order && (
        <div className="flex flex-col gap-5">
          {/* header card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <button
                    onClick={() => navigate('/profile/orders')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-bold text-gray-800">جزئیات سفارش</h2>
                </div>
                <div className="flex items-center gap-3 mr-8">
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-700">
                    #{order.tracking_code || order.id}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {order.status === 'pending' && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors"
                  >
                    لغو سفارش
                  </button>
                )}
                <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* items + shipping */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* order items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-sm">اقلام سفارش</h3>
                <div className="flex flex-col divide-y divide-gray-50">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{item.product_name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">تعداد: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* totals */}
                <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col gap-2">
                  {order.shipping_cost != null && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>هزینه ارسال</span>
                      <span>{formatPrice(order.shipping_cost)}</span>
                    </div>
                  )}
                  {order.discount_amount != null && order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>تخفیف</span>
                      <span>- {formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>مجموع</span>
                    <span>{formatPrice(order.total_price)}</span>
                  </div>
                </div>
              </div>

              {/* delivery address */}
              {order.address && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">آدرس تحویل</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                    {order.address.title && (
                      <p className="font-semibold text-gray-800 mb-1">{order.address.title}</p>
                    )}
                    <p>
                      {order.address.province && `${order.address.province}، `}
                      {order.address.city && `${order.address.city}، `}
                      {order.address.street}
                    </p>
                    {order.address.postal_code && (
                      <p className="text-gray-400 text-xs mt-1">
                        کد پستی: <span dir="ltr">{order.address.postal_code}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* shipping + tracking */}
              {(order.shipping_method || order.postal_tracking) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm">اطلاعات ارسال</h3>
                  <div className="flex flex-col gap-3">
                    {order.shipping_method && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">روش ارسال</span>
                        <span className="font-medium text-gray-800">{order.shipping_method}</span>
                      </div>
                    )}
                    {order.postal_tracking && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">کد رهگیری پستی</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-gray-800" dir="ltr">
                            {order.postal_tracking}
                          </span>
                          <a
                            href={`https://tracking.post.ir/?code=${order.postal_tracking}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-white text-xs hover:bg-primary-dark transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            رهگیری مرسوله
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
              <h3 className="font-bold text-gray-800 mb-5 text-sm">تاریخچه وضعیت</h3>
              <OrderTimeline history={order.history || order.status_history || []} />
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  )
}
