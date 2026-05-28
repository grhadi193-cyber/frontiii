import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import StepIndicator from '../components/StepIndicator.jsx'
import AddressCard from '../components/AddressCard.jsx'
import ShippingMethodCard from '../components/ShippingMethodCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import {
  getAddresses, addAddress,
  getProvinces, getCities,
  calculateShipping,
  createOrder, initiatePayment,
} from '../api/django.js'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// ── Step 1: Address ────────────────────────────────────────────
function StepAddress({ token, onNext }) {
  const [addresses, setAddresses] = useState([])
  const [selected, setSelected]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showForm, setShowForm]   = useState(false)

  useEffect(() => {
    getAddresses(token)
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || [])
        setAddresses(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => setError('خطا در بارگذاری آدرس‌ها'))
      .finally(() => setLoading(false))
  }, [token])

  function handleAddressAdded(addr) {
    setAddresses(prev => [...prev, addr])
    setSelected(addr)
    setShowForm(false)
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <LoadingSpinner size="lg" text="بارگذاری آدرس‌ها..." />
    </div>
  )

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {/* Address list */}
      {addresses.length > 0 && (
        <div className="space-y-3 mb-4">
          {addresses.map(addr => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={selected?.id === addr.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {/* Add address button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-300 hover:border-primary text-gray-500 hover:text-primary rounded-2xl py-4 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          افزودن آدرس جدید
        </button>
      )}

      {/* Inline address form */}
      {showForm && (
        <AddressForm
          token={token}
          onSaved={handleAddressAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Next button */}
      <button
        disabled={!selected}
        onClick={() => onNext(selected)}
        className="mt-6 w-full bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-colors"
      >
        {selected ? 'ادامه — انتخاب روش ارسال' : 'لطفاً یک آدرس انتخاب کنید'}
      </button>
    </div>
  )
}

function AddressForm({ token, onSaved, onCancel }) {
  const [provinces, setProvinces] = useState([])
  const [cities, setCities]       = useState([])
  const [form, setForm] = useState({
    province: '', province_id: '',
    city: '', city_id: '',
    street: '', postal_code: '', title: 'خانه',
  })
  const [loading, setLoading]   = useState(false)
  const [loadProv, setLoadProv] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    getProvinces()
      .then(data => setProvinces(Array.isArray(data) ? data : (data.results || [])))
      .catch(() => setError('خطا در بارگذاری استان‌ها'))
      .finally(() => setLoadProv(false))
  }, [])

  function handleProvince(e) {
    const id   = e.target.value
    const name = e.target.options[e.target.selectedIndex].text
    setForm(f => ({ ...f, province_id: id, province: name, city: '', city_id: '' }))
    setCities([])
    if (!id) return
    getCities(id)
      .then(data => setCities(Array.isArray(data) ? data : (data.results || [])))
      .catch(() => setError('خطا در بارگذاری شهرها'))
  }

  function handleCity(e) {
    const id   = e.target.value
    const name = e.target.options[e.target.selectedIndex].text
    setForm(f => ({ ...f, city_id: id, city: name }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.province) return setError('استان را انتخاب کنید')
    if (!form.city)     return setError('شهر را انتخاب کنید')
    if (!form.street)      return setError('آدرس خیابان را وارد کنید')
    if (form.postal_code && form.postal_code.replace(/\D/g, '').length !== 10)
      return setError('کد پستی باید ۱۰ رقم باشد')

    setLoading(true)
    try {
      const payload = {
        title:       form.title || 'خانه',
        province:    form.province,
        city:        form.city,
        street:      form.street,
        postal_code: form.postal_code,
        is_default:  false,
      }
      const saved = await addAddress(token, payload)
      onSaved({ ...saved, province_id: parseInt(form.province_id), city_id: parseInt(form.city_id) })
    } catch (err) {
      setError(err.message || 'خطا در ذخیره آدرس')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 mt-3 border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-4">آدرس جدید</h3>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">عنوان آدرس</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="مثلاً: خانه، محل کار"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">استان *</label>
          <select
            value={form.province_id}
            onChange={handleProvince}
            disabled={loadProv}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white appearance-none"
          >
            <option value="">{loadProv ? 'در حال بارگذاری...' : 'انتخاب استان'}</option>
            {provinces.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">شهر *</label>
          <select
            value={form.city_id}
            onChange={handleCity}
            disabled={!form.province_id || cities.length === 0}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white appearance-none disabled:bg-gray-100"
          >
            <option value="">
              {!form.province_id ? 'ابتدا استان را انتخاب کنید' : cities.length === 0 ? 'در حال بارگذاری...' : 'انتخاب شهر'}
            </option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Street */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">آدرس خیابان *</label>
          <textarea
            value={form.street}
            onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
            placeholder="خیابان، کوچه، پلاک، طبقه..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white resize-none"
          />
        </div>

        {/* Postal code */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">کد پستی</label>
          <input
            type="text"
            value={form.postal_code}
            onChange={e => setForm(f => ({ ...f, postal_code: e.target.value.replace(/\D/g, '') }))}
            placeholder="۱۰ رقم"
            maxLength={10}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? 'در حال ذخیره...' : 'ذخیره آدرس'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          انصراف
        </button>
      </div>
    </form>
  )
}

// ── Step 2: Shipping ───────────────────────────────────────────
function StepShipping({ token, address, items, onNext, onBack }) {
  const [methods, setMethods]   = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!address) return

    async function fetchShipping() {
      const totalWeight = items.reduce((s, i) => s + (i.weight || 0) * i.quantity, 0)

      let provinceId = address.province_id
      let cityId     = address.city_id

      // آدرس‌های قدیمی که از بک‌اند میان فقط رشته province/city دارن، نه ID
      // باید ID رو با کمک لیست استان‌ها پیدا کنیم
      if (!provinceId) {
        try {
          const provinces = await getProvinces()
          const matched = provinces.find(p =>
            p.name === address.province || p.name?.trim() === address.province?.trim()
          )
          if (matched) {
            provinceId = matched.id
            // اگه cityId هم نداریم، شهر رو هم جستجو کن
            if (!cityId && address.city) {
              const cities = await getCities(matched.id)
              const matchedCity = cities.find(c =>
                c.name === address.city || c.name?.trim() === address.city?.trim()
              )
              if (matchedCity) cityId = matchedCity.id
            }
          }
        } catch (_) {}
      }

      if (!provinceId) {
        setError('استان آدرس انتخاب‌شده معتبر نیست. لطفاً آدرس جدید ثبت کنید.')
        setLoading(false)
        return
      }

      calculateShipping({
        province_id:  provinceId,
        city_id:      cityId || null,
        total_weight: totalWeight,
        order_total:  0,
      })
        .then(data => {
          const list = Array.isArray(data) ? data : (data.options || data.methods || data.results || [])
          setMethods(list)
          if (list.length > 0) setSelected(list[0])
        })
        .catch(() => setError('خطا در محاسبه هزینه ارسال'))
        .finally(() => setLoading(false))
    }

    fetchShipping()
  }, [address])

  if (loading) return (
    <div className="flex justify-center py-12">
      <LoadingSpinner size="lg" text="محاسبه هزینه ارسال..." />
    </div>
  )

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {methods.length === 0 && !error && (
        <p className="text-center text-gray-500 py-8">روش ارسالی یافت نشد</p>
      )}

      <div className="space-y-3 mb-6">
        {methods.map(m => (
          <ShippingMethodCard
            key={m.id}
            method={m}
            selected={selected?.id === m.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
        >
          بازگشت
        </button>
        <button
          disabled={!selected}
          onClick={() => onNext(selected)}
          className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
        >
          ادامه — تأیید سفارش
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Confirm ────────────────────────────────────────────
function StepConfirm({ token, items, address, shipping, totalPrice, onBack, onPaid }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const shippingCost = Number(shipping?.cost ?? shipping?.price ?? 0)
  const grandTotal   = totalPrice + shippingCost

  async function handlePay() {
    setLoading(true)
    setError('')
    const idKey = generateUUID()
    try {
      const orderPayload = {
        address_id: address.id,
        shipping_method_id: shipping.id,
        idempotency_key: idKey,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.price,
        })),
      }
      const order = await createOrder(token, orderPayload)
      const payment = await initiatePayment(token, order.id, idKey)
      onPaid() // clearCart
      window.location.href = payment.payment_url
    } catch (err) {
      setError(err.message || 'خطا در ثبت سفارش')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {/* Items summary */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">آیتم‌های سفارش</h3>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.product_id} className="flex justify-between text-sm">
              <span className="text-gray-600 truncate max-w-[60%]">
                {item.name}
                <span className="text-gray-400 mr-1">
                  × {String(item.quantity).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}
                </span>
              </span>
              <span className="font-medium text-gray-800">
                {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">آدرس تحویل</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {address.province && `${address.province}، `}
          {address.city && `${address.city}، `}
          {address.street}
        </p>
        {address.postal_code && (
          <p className="text-xs text-gray-400 mt-1">کد پستی: {address.postal_code}</p>
        )}
      </div>

      {/* Shipping */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">روش ارسال</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{shipping.name}</span>
          <span className="font-medium">
            {shippingCost === 0 ? 'رایگان' : `${shippingCost.toLocaleString('fa-IR')} تومان`}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">جمع کالاها</span>
          <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-600">هزینه ارسال</span>
          <span>{shippingCost === 0 ? 'رایگان' : `${shippingCost.toLocaleString('fa-IR')} تومان`}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-primary/20 pt-3">
          <span className="text-gray-800">مجموع پرداختی</span>
          <span className="text-primary">{grandTotal.toLocaleString('fa-IR')} تومان</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
        >
          بازگشت
        </button>
        <button
          onClick={handlePay}
          disabled={loading}
          className="flex-1 bg-accent hover:bg-accent-dark text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              در حال انتقال به درگاه...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              پرداخت — {grandTotal.toLocaleString('fa-IR')} تومان
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Main Checkout ──────────────────────────────────────────────
export default function Checkout() {
  const { token }                   = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const navigate                    = useNavigate()
  const [step, setStep]             = useState(1)
  const [address, setAddress]       = useState(null)
  const [shipping, setShipping]     = useState(null)

  // اگر سبد خالی بود برگرد
  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true })
  }, [])

  function handleAddressNext(addr) {
    setAddress(addr)
    setStep(2)
  }

  function handleShippingNext(method) {
    setShipping(method)
    setStep(3)
  }

  function handlePaid() {
    clearCart()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">تکمیل خرید</h1>

        <StepIndicator current={step} />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {step === 1 && (
            <StepAddress token={token} onNext={handleAddressNext} />
          )}
          {step === 2 && (
            <StepShipping
              token={token}
              address={address}
              items={items}
              onNext={handleShippingNext}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepConfirm
              token={token}
              items={items}
              address={address}
              shipping={shipping}
              totalPrice={totalPrice}
              onBack={() => setStep(2)}
              onPaid={handlePaid}
            />
          )}
        </div>
      </div>
    </div>
  )
}
