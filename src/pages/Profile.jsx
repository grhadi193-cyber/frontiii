import React, { useState } from 'react'
import ProfileLayout from '../components/ProfileLayout.jsx'
import ToastContainer, { useToast } from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { toasts, showToast } = useToast()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    national_id: user?.national_id || '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = 'نام الزامی است'
    if (!form.last_name.trim())  errs.last_name  = 'نام خانوادگی الزامی است'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'ایمیل معتبر نیست'
    }
    if (form.national_id && !/^\d{10}$/.test(form.national_id)) {
      errs.national_id = 'کد ملی باید ۱۰ رقم باشد'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await updateProfile(form)
      showToast('اطلاعات با موفقیت ذخیره شد', 'success')
    } catch (err) {
      showToast(err.message || 'خطا در ذخیره اطلاعات', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileLayout>
      <ToastContainer toasts={toasts} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          اطلاعات حساب
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* first_name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نام</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="نام خود را وارد کنید"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.first_name
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>

            {/* last_name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نام خانوادگی</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="نام خانوادگی خود را وارد کنید"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.last_name
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>

            {/* email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ایمیل</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                dir="ltr"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all text-left
                  ${errors.email
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* national_id */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">کد ملی</label>
              <input
                type="text"
                name="national_id"
                value={form.national_id}
                onChange={handleChange}
                placeholder="۱۰ رقم"
                maxLength={10}
                dir="ltr"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all text-left
                  ${errors.national_id
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              {errors.national_id && <p className="text-red-500 text-xs mt-1">{errors.national_id}</p>}
            </div>

            {/* phone — readonly */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل</label>
              <input
                type="text"
                value={user?.phone_number || ''}
                readOnly
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 text-left cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">شماره موبایل قابل تغییر نیست</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
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
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </ProfileLayout>
  )
}
