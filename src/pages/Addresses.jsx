import React, { useEffect, useState, useCallback } from 'react'
import ProfileLayout from '../components/ProfileLayout.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ToastContainer, { useToast } from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  getProvinces,
  getCities,
} from '../api/django.js'

const EMPTY_FORM = {
  title: '',
  province_id: '',
  city_id: '',
  street: '',
  postal_code: '',
  is_default: false,
}

function InputField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function Addresses() {
  const { token } = useAuth()
  const { toasts, showToast } = useToast()

  const [addresses, setAddresses]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [errors, setErrors]         = useState({})
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [settingId, setSettingId]   = useState(null)

  // provinces / cities
  const [provinces, setProvinces]   = useState([])
  const [cities, setCities]         = useState([])
  const [provLoading, setProvLoading] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)

  // ── بارگذاری آدرس‌ها ──────────────────────────────────────────────────────
  const loadAddresses = useCallback(async () => {
    try {
      const data = await getAddresses(token)
      setAddresses(Array.isArray(data) ? data : [])
    } catch (err) {
      showToast(err.message || 'خطا در دریافت آدرس‌ها', 'error')
    } finally {
      setLoading(false)
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadAddresses() }, [loadAddresses])

  // ── بارگذاری استان‌ها ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!showForm) return
    setProvLoading(true)
    getProvinces()
      .then((data) => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => showToast('خطا در دریافت استان‌ها', 'error'))
      .finally(() => setProvLoading(false))
  }, [showForm]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── بارگذاری شهرها وقتی استان عوض شد ─────────────────────────────────────
  useEffect(() => {
    if (!form.province_id) { setCities([]); return }
    setCityLoading(true)
    setForm((prev) => ({ ...prev, city_id: '' }))
    getCities(form.province_id)
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => showToast('خطا در دریافت شهرها', 'error'))
      .finally(() => setCityLoading(false))
  }, [form.province_id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── validation ────────────────────────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!form.province_id)         errs.province_id = 'استان الزامی است'
    if (!form.city_id)             errs.city_id     = 'شهر الزامی است'
    if (!form.street.trim())       errs.street      = 'آدرس الزامی است'
    if (!form.postal_code.trim())  errs.postal_code = 'کد پستی الزامی است'
    else if (!/^\d{10}$/.test(form.postal_code.replace(/-/g, '')))
      errs.postal_code = 'کد پستی باید ۱۰ رقم باشد'
    return errs
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // ── ثبت آدرس جدید ─────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const selectedProvince = provinces.find((p) => String(p.id) === String(form.province_id))
    const selectedCity     = cities.find((c) => String(c.id) === String(form.city_id))

    if (!selectedProvince || !selectedCity) {
      showToast('استان یا شهر انتخاب‌شده نامعتبر است', 'error')
      return
    }

    setSaving(true)
    try {
      await addAddress(token, {
        title:       form.title.trim() || `${selectedCity.name}، ${selectedProvince.name}`,
        province:    selectedProvince.name,
        city:        selectedCity.name,
        street:      form.street.trim(),
        postal_code: form.postal_code.replace(/-/g, ''),
        is_default:  form.is_default,
      })
      showToast('آدرس با موفقیت اضافه شد', 'success')
      setForm(EMPTY_FORM)
      setShowForm(false)
      await loadAddresses()
    } catch (err) {
      showToast(err.message || 'خطا در ثبت آدرس', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── حذف آدرس ──────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('آیا مطمئن هستید؟ این آدرس حذف خواهد شد.')) return
    setDeletingId(id)
    try {
      await deleteAddress(token, id)
      showToast('آدرس حذف شد', 'success')
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      showToast(err.message || 'خطا در حذف آدرس', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // ── پیش‌فرض کردن ──────────────────────────────────────────────────────────
  async function handleSetDefault(id) {
    setSettingId(id)
    try {
      await setDefaultAddress(token, id)
      showToast('آدرس پیش‌فرض تنظیم شد', 'success')
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      )
    } catch (err) {
      showToast(err.message || 'خطا در تنظیم پیش‌فرض', 'error')
    } finally {
      setSettingId(null)
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <ProfileLayout>
      <ToastContainer toasts={toasts} />

      <div className="space-y-4">
        {/* ── هدر ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              آدرس‌های من
            </h2>
            <button
              onClick={() => { setShowForm((v) => !v); setForm(EMPTY_FORM); setErrors({}) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'انصراف' : 'آدرس جدید'}
            </button>
          </div>
        </div>

        {/* ── فرم افزودن آدرس ── */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-primary/20 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-5">افزودن آدرس جدید</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* عنوان */}
                <InputField label="عنوان آدرس (اختیاری)" error={errors.title}>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="مثال: خانه، محل کار"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </InputField>

                {/* استان */}
                <InputField label="استان" error={errors.province_id}>
                  <select
                    name="province_id"
                    value={form.province_id}
                    onChange={handleChange}
                    disabled={provLoading}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white
                      ${errors.province_id
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      } disabled:opacity-60`}
                  >
                    <option value="">{provLoading ? 'در حال بارگذاری...' : 'انتخاب استان'}</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </InputField>

                {/* شهر */}
                <InputField label="شهر" error={errors.city_id}>
                  <select
                    name="city_id"
                    value={form.city_id}
                    onChange={handleChange}
                    disabled={!form.province_id || cityLoading}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white
                      ${errors.city_id
                        ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      } disabled:opacity-60`}
                  >
                    <option value="">
                      {cityLoading
                        ? 'در حال بارگذاری...'
                        : form.province_id ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'}
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </InputField>

                {/* کد پستی */}
                <InputField label="کد پستی" error={errors.postal_code}>
                  <input
                    type="text"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    placeholder="۱۰ رقم"
                    maxLength={10}
                    dir="ltr"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all text-left
                      ${errors.postal_code
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                  />
                </InputField>

                {/* آدرس کامل */}
                <div className="sm:col-span-2">
                  <InputField label="آدرس کامل" error={errors.street}>
                    <textarea
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      rows={3}
                      placeholder="خیابان، کوچه، پلاک، واحد..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none
                        ${errors.street
                          ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                        }`}
                    />
                  </InputField>
                </div>

                {/* پیش‌فرض */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={form.is_default}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                        ${form.is_default ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                        {form.is_default && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">این آدرس را به عنوان پیش‌فرض تنظیم کن</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setErrors({}) }}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  )}
                  {saving ? 'در حال ثبت...' : 'ثبت آدرس'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── لیست آدرس‌ها ── */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">هنوز آدرسی ثبت نکرده‌اید</p>
            <p className="text-gray-400 text-sm mt-1">با کلیک روی «آدرس جدید» اولین آدرس خود را اضافه کنید</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-colors
                  ${addr.is_default ? 'border-primary/30 bg-primary/5' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-800 text-sm">
                        {addr.title || 'آدرس'}
                      </span>
                      {addr.is_default && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          پیش‌فرض
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {addr.province && `${addr.province}، `}
                      {addr.city && `${addr.city}، `}
                      {addr.street}
                    </p>
                    {addr.postal_code && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        کد پستی: <span dir="ltr" className="font-mono">{addr.postal_code}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!addr.is_default && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={settingId === addr.id}
                        title="تنظیم به عنوان پیش‌فرض"
                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50"
                      >
                        {settingId === addr.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                      title="حذف آدرس"
                      className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {deletingId === addr.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  )
}
