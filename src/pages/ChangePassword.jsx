import React, { useState } from 'react'
import ProfileLayout from '../components/ProfileLayout.jsx'
import ToastContainer, { useToast } from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { changePassword } from '../api/django.js'

function EyeIcon({ show }) {
  return show ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function ChangePassword() {
  const { token, user } = useAuth()
  const { toasts, showToast } = useToast()
  const hasPassword = user?.has_password ?? true // default to true if unknown

  const [form, setForm] = useState({
    old_password:     '',
    new_password:     '',
    confirm_password: '',
  })
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [show, setShow]       = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  })
  const [success, setSuccess] = useState(false)

  function toggleShow(field) {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    if (success) setSuccess(false)
  }

  function validate() {
    const errs = {}
    if (!form.old_password)
      errs.old_password = 'رمز عبور فعلی الزامی است'
    if (!form.new_password)
      errs.new_password = 'رمز عبور جدید الزامی است'
    else if (form.new_password.length < 6)
      errs.new_password = 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد'
    if (!form.confirm_password)
      errs.confirm_password = 'تکرار رمز عبور الزامی است'
    else if (form.new_password !== form.confirm_password)
      errs.confirm_password = 'رمز عبور و تکرار آن یکسان نیستند'
    if (form.old_password && form.new_password && form.old_password === form.new_password)
      errs.new_password = 'رمز عبور جدید باید با رمز فعلی متفاوت باشد'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await changePassword(token, {
        old_password: form.old_password,
        new_password: form.new_password,
      })
      setSuccess(true)
      setForm({ old_password: '', new_password: '', confirm_password: '' })
      showToast('رمز عبور با موفقیت تغییر یافت', 'success')
    } catch (err) {
      showToast(err.message || 'خطا در تغییر رمز عبور', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── strength indicator ────────────────────────────────────────────────────
  function getStrength(pwd) {
    if (!pwd) return { level: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 6)  score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { level: 1, label: 'ضعیف',    color: 'bg-red-400' }
    if (score <= 3) return { level: 2, label: 'متوسط',   color: 'bg-yellow-400' }
    return             { level: 3, label: 'قوی',      color: 'bg-green-500' }
  }

  const strength = getStrength(form.new_password)

  return (
    <ProfileLayout>
      <ToastContainer toasts={toasts} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </span>
          تغییر رمز عبور
        </h2>

        {/* ── no-password banner ── */}
        {!hasPassword && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-800 text-sm font-medium">شما هنوز رمز عبور ندارید</p>
              <p className="text-amber-700 text-xs mt-1">
                از طریق گزینه «فراموشی رمز عبور» در صفحه ورود، ابتدا یک رمز برای حساب خود تنظیم کنید.
              </p>
            </div>
          </div>
        )}

        {/* ── success banner ── */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 text-sm font-medium">رمز عبور با موفقیت تغییر یافت!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="max-w-md space-y-5">

          {/* رمز فعلی */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور فعلی</label>
            <div className="relative">
              <input
                type={show.old_password ? 'text' : 'password'}
                name="old_password"
                value={form.old_password}
                onChange={handleChange}
                placeholder="رمز عبور فعلی خود را وارد کنید"
                dir="ltr"
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all text-left
                  ${errors.old_password
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              <button
                type="button"
                onClick={() => toggleShow('old_password')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon show={show.old_password} />
              </button>
            </div>
            {errors.old_password && <p className="text-red-500 text-xs mt-1">{errors.old_password}</p>}
          </div>

          {/* رمز جدید */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور جدید</label>
            <div className="relative">
              <input
                type={show.new_password ? 'text' : 'password'}
                name="new_password"
                value={form.new_password}
                onChange={handleChange}
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all text-left
                  ${errors.new_password
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              <button
                type="button"
                onClick={() => toggleShow('new_password')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon show={show.new_password} />
              </button>
            </div>
            {/* strength bar */}
            {form.new_password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300
                        ${strength.level >= lvl ? strength.color : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium
                  ${strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                  قدرت رمز: {strength.label}
                </p>
              </div>
            )}
            {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>}
          </div>

          {/* تکرار رمز جدید */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">تکرار رمز عبور جدید</label>
            <div className="relative">
              <input
                type={show.confirm_password ? 'text' : 'password'}
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="رمز عبور جدید را مجدداً وارد کنید"
                dir="ltr"
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all text-left
                  ${errors.confirm_password
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : form.confirm_password && form.new_password === form.confirm_password
                      ? 'border-green-400 focus:ring-2 focus:ring-green-200'
                      : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              <button
                type="button"
                onClick={() => toggleShow('confirm_password')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon show={show.confirm_password} />
              </button>
              {form.confirm_password && form.new_password === form.confirm_password && (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-green-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
          </div>

          {/* راهنمای امنیت */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 mb-2">نکات انتخاب رمز عبور قوی:</p>
            <ul className="space-y-1">
              {[
                'حداقل ۶ کاراکتر داشته باشد',
                'ترکیبی از حروف بزرگ و کوچک انگلیسی',
                'شامل اعداد و نمادهای خاص (@، #، !)',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
              {saving ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
            </button>
          </div>
        </form>
      </div>
    </ProfileLayout>
  )
}
