import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileLayout from '../components/ProfileLayout.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getOrders } from '../api/django.js'

function formatPrice(num) {
  if (num == null) return '—'
  return Number(num).toLocaleString('fa-IR') + ' تومان'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export default function Orders() {
  const { token } = useAuth()
  const navigate  = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getOrders(token)
      .then((data) => setOrders(Array.isArray(data) ? data : (data?.results ?? [])))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <ProfileLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </span>
          سفارشات من
        </h2>

        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center text-red-600 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">سفارشی ثبت نشده است</p>
            <p className="text-gray-400 text-sm mt-1">اولین سفارش خود را ثبت کنید</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            {/* desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-right pb-3 font-semibold text-gray-500 pr-0">شماره سفارش</th>
                    <th className="text-right pb-3 font-semibold text-gray-500">تاریخ</th>
                    <th className="text-right pb-3 font-semibold text-gray-500">مبلغ</th>
                    <th className="text-right pb-3 font-semibold text-gray-500">وضعیت</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/profile/orders/${order.id}`)}
                      className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-4 pr-0">
                        <span className="font-mono font-medium text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded-lg">
                          #{order.tracking_code || order.id}
                        </span>
                      </td>
                      <td className="py-4 text-gray-600">{formatDate(order.created_at)}</td>
                      <td className="py-4 font-medium text-gray-800">{formatPrice(order.total_price)}</td>
                      <td className="py-4">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="py-4 text-left">
                        <svg className="w-4 h-4 text-gray-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/profile/orders/${order.id}`)}
                  className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                      #{order.tracking_code || order.id}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{formatDate(order.created_at)}</span>
                    <span className="font-medium text-gray-800">{formatPrice(order.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ProfileLayout>
  )
}
