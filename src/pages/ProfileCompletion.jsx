import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ToastContainer, { useToast } from '../components/Toast.jsx'

/**
 * ProfileCompletion — Post-registration profile setup page.
 * After initial OTP login/registration, users complete their profile.
 * Fields match the backend: full_name, email, national_id + password.
 * After save → redirect to cart (if items exist) or home.
 */
export default function ProfileCompletion() {
  const { user, token, isLoggedIn, updateProfile } = useAuth()
  const { items: cartItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const { toasts, showToast } = useToast()

  // where to go after completion — cart if has items, else from-state or home
  const afterComplete = cartItems && cartItems.length > 0
    ? '/cart'
    : (location.state?.from || '/')

  useEffect(() => {
    if (!isLoggedIn) navigate('/login', { replace: true })
  }, [isLoggedIn, navigate])

  const [form, setForm] = useState({
    full_name: '',
    national_id: '',
    email: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1) // 1 = personal info, 2 = password

  // Pre-fill from user data
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        national_id: user.national_id || '',
        email: user.email || '',
      })
    }
  }, [user])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validateStep1() {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'نام و نام خانوادگی الزامی است'
    if (!form.national_id.trim()) {
      errs.national_id = 'کد ملی الزامی است'
    } else if (!/^\d{10}$/.test(form.national_id)) {
      errs.national_id = 'کد ملی باید ۱۰ رقم باشد'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'ایمیل معتبر نیست'
    }
    return errs
  }

  function validateStep2() {
    const errs = {}
    if (!passwordForm.password) {
      errs.password = 'رمز عبور الزامی است'
    } else if (passwordForm.password.length < 6) {
      errs.password = 'رمز عبور حداقل ۶ کاراکتر'
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'تکرار رمز عبور مطابقت ندارد'
    }
    return errs
  }

  function handleNext() {
    const errs = validateStep1()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      showToast('لطفاً خطاها را برطرف کنید', 'error')
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    const step1Errs = validateStep1()
    const step2Errs = validateStep2()
    const allErrs = { ...step1Errs, ...step2Errs }

    if (Object.keys(allErrs).length > 0) {
      setErrors(allErrs)
      if (Object.keys(step1Errs).length > 0) setStep(1)
      showToast('لطفاً خطاها را برطرف کنید', 'error')
      return
    }

    setSaving(true)
    try {
      const updateData = {
        full_name: form.full_name.trim(),
        national_id: form.national_id.trim(),
        email: form.email.trim() || null,
        password: passwordForm.password || undefined,
      }

      // یک PATCH واحد — پروفایل و رمز همزمان
      await updateProfile(updateData)

      showToast('اطلاعات با موفقیت ذخیره شد!', 'success')
      setTimeout(() => {
        navigate(afterComplete, { replace: true })
      }, 1200)
    } catch (err) {
      showToast(err.message || 'خطا در ذخیره اطلاعات', 'error')
    } finally {
      setSaving(false)
    }
  }

  function getStrength(pwd) {
    if (!pwd) return { level: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { level: 1, label: 'ضعیف', color: 'bg-red-400' }
    if (score <= 3) return { level: 2, label: 'متوسط', color: 'bg-yellow-400' }
    return { level: 3, label: 'قوی', color: 'bg-green-500' }
  }

  const strength = getStrength(passwordForm.password)

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <ToastContainer toasts={toasts} />

      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-l from-primary to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">تکمیل اطلاعات کاربری</h1>
          <p className="text-gray-500 text-sm mt-2">
            برای استفاده از خدمات سایت، لطفاً اطلاعات خود را تکمیل کنید
          </p>
          {cartItems && cartItems.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              بعد از تکمیل، به سبد خریدتان منتقل می‌شوید
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>۱</div>
            <span className="text-sm font-medium">اطلاعات شخصی</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200">
            <div className={`h-full bg-primary transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>۲</div>
            <span className="text-sm font-medium">تنظیم رمز عبور</span>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-gradient-to-l from-primary to-indigo-600 transition-all"
              style={{ width: step === 1 ? '50%' : '100%' }} />
          </div>

          <div className="p-6 sm:p-8">
            {/* ─── Step 1: Personal Info ─── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      این اطلاعات برای پردازش سفارش‌ها ضروری است.
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    نام و نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                      ${errors.full_name ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                  />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    کد ملی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="national_id"
                    value={form.national_id}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setForm((prev) => ({ ...prev, national_id: val }))
                      setErrors((prev) => ({ ...prev, national_id: '' }))
                    }}
                    placeholder="۱۰ رقم"
                    maxLength={10}
                    dir="ltr"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all text-left
                      ${errors.national_id ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                  />
                  {errors.national_id && <p className="text-red-500 text-xs mt-1">{errors.national_id}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ایمیل <span className="text-gray-400 text-xs">(اختیاری)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    dir="ltr"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all text-left
                      ${errors.email ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone (read-only) */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل</label>
                  <input
                    type="text"
                    value={user?.phone_number || ''}
                    readOnly
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 text-left cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">شماره موبایل ثبت‌شده و قابل تغییر نیست</p>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  ادامه
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            )}

            {/* ─── Step 2: Password ─── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      یک رمز عبور قوی انتخاب کنید. این رمز برای ورود بعدی با شماره موبایل استفاده خواهد شد.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    رمز عبور <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    placeholder="حداقل ۶ کاراکتر"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                      ${errors.password ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                  />
                  {passwordForm.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1.5">
                        {[1, 2, 3].map((lvl) => (
                          <div key={lvl}
                            className={`flex-1 rounded-full transition-colors duration-300 ${
                              strength.level >= lvl ? strength.color : 'bg-gray-200'
                            }`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>قدرت رمز: {strength.label}</p>
                    </div>
                  )}
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    تکرار رمز عبور <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="تکرار رمز عبور"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                      ${errors.confirmPassword ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : passwordForm.confirmPassword && passwordForm.password === passwordForm.confirmPassword
                          ? 'border-green-400 focus:ring-2 focus:ring-green-200'
                          : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-[2] py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving && (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    {saving ? 'در حال ذخیره...' : 'ذخیره و ورود'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
