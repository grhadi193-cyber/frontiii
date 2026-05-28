import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import OtpInput from '../components/OtpInput.jsx'
import CountdownTimer from '../components/CountdownTimer.jsx'
import { sendOtp, verifyOtp, login as loginApi } from '../api/django.js'

// ───── helpers ─────
function validatePhone(phone) {
  return /^09[0-9]{9}$/.test(phone)
}

// ───── کامپوننت‌های کوچک ─────
function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

// ───── صفحه اصلی ─────
export default function Login() {
  const { login, isLoggedIn, isProfileComplete } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  // اگر قبلاً لاگین بود
  useEffect(() => {
    if (isLoggedIn) {
      // اگر پروفایل تکمیل نشده، به صفحه تکمیل پروفایل ببر
      if (!isProfileComplete) {
        navigate('/profile/complete', { replace: true })
      } else {
        navigate(redirectTo, { replace: true })
      }
    }
  }, [isLoggedIn, isProfileComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const [tab, setTab] = useState('otp') // 'otp' | 'password'

  // ── OTP state ──
  const [phone, setPhone]         = useState('')
  const [otpStep, setOtpStep]     = useState(1) // 1 = ارسال کد، 2 = تأیید کد
  const [otp, setOtp]             = useState('')
  const [timerExpired, setTimerExpired] = useState(false)
  const timerRestartRef = useRef(null)

  // ── Password state ──
  const [pwPhone, setPwPhone]     = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)

  // ── shared ──
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  function clearMessages() { setError(''); setSuccess('') }

  // ── OTP: مرحله ۱ — ارسال ──
  async function handleSendOtp(e) {
    e.preventDefault()
    clearMessages()
    if (!validatePhone(phone)) {
      setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
      return
    }
    setLoading(true)
    try {
      await sendOtp(phone)
      setOtpStep(2)
      setOtp('')
      setTimerExpired(false)
      setSuccess('کد تأیید ارسال شد')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── OTP: ارسال مجدد ──
  async function handleResendOtp() {
    clearMessages()
    setLoading(true)
    try {
      await sendOtp(phone)
      setOtp('')
      setTimerExpired(false)
      timerRestartRef.current?.(120)
      setSuccess('کد جدید ارسال شد')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── OTP: مرحله ۲ — تأیید ──
  async function handleVerifyOtp(e) {
    e.preventDefault()
    clearMessages()
    if (otp.replace(/\s/g, '').length < 6) {
      setError('کد ۶ رقمی را کامل وارد کنید')
      return
    }
    setLoading(true)
    try {
      const data = await verifyOtp(phone, otp.trim())
      const userData = data.user || data
      login(data.access || data.token, userData)
      // اگر پروفایل تکمیل نشده، به صفحه تکمیل پروفایل ببر
      const profileComplete = !!(userData.profile_completed ||
        (userData.first_name && userData.last_name && userData.national_id) ||
        (userData.full_name && userData.national_id))
      if (!profileComplete) {
        navigate('/profile/complete', { replace: true, state: { from: redirectTo } })
      } else {
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      setError(err.message)
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  // ── Password: ورود ──
  async function handlePasswordLogin(e) {
    e.preventDefault()
    clearMessages()
    if (!validatePhone(pwPhone)) {
      setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
      return
    }
    if (!password) {
      setError('رمز عبور را وارد کنید')
      return
    }
    setLoading(true)
    try {
      const data = await loginApi(pwPhone, password)
      login(data.access || data.token, data.user || data)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">

        {/* کارت */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* هدر */}
          <div className="bg-gradient-to-l from-primary to-indigo-600 px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-white text-xl font-bold">ورود به حساب کاربری</h1>
            <p className="text-white/70 text-sm mt-1">ATI Farzam Iranian GPS</p>
          </div>

          <div className="p-6">

            {/* پیام‌ها */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {success}
              </div>
            )}

            {/* tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
              <TabButton active={tab === 'otp'} onClick={() => { setTab('otp'); clearMessages(); setOtpStep(1) }}>
                ورود با کد OTP
              </TabButton>
              <TabButton active={tab === 'password'} onClick={() => { setTab('password'); clearMessages() }}>
                ورود با رمز عبور
              </TabButton>
            </div>

            {/* ──── OTP TAB ──── */}
            {tab === 'otp' && (
              <>
                {otpStep === 1 ? (
                  <form onSubmit={handleSendOtp} noValidate>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      شماره موبایل
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                      dir="ltr"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                    <button
                      type="submit"
                      disabled={loading || phone.length < 11}
                      className="mt-4 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      )}
                      {loading ? 'در حال ارسال...' : 'ارسال کد تأیید'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} noValidate>
                    {/* اطلاعات شماره */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        کد به <span dir="ltr" className="font-mono font-bold text-gray-800">{phone}</span> ارسال شد
                      </span>
                      <button
                        type="button"
                        onClick={() => { setOtpStep(1); setOtp(''); clearMessages() }}
                        className="text-xs text-primary hover:underline"
                      >
                        ویرایش شماره
                      </button>
                    </div>

                    {/* OTP Inputs */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        کد ۶ رقمی را وارد کنید
                      </label>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        disabled={loading}
                        hasError={!!error}
                      />
                    </div>

                    {/* تایمر + ارسال مجدد */}
                    <div className="flex items-center justify-center gap-2 mb-5 text-sm">
                      {!timerExpired ? (
                        <>
                          <span className="text-gray-400">اعتبار کد:</span>
                          <CountdownTimer
                            seconds={120}
                            onExpire={() => setTimerExpired(true)}
                            restartRef={timerRestartRef}
                          />
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-primary font-medium hover:underline disabled:opacity-60"
                        >
                          ارسال مجدد کد
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      )}
                      {loading ? 'در حال تأیید...' : 'تأیید و ورود'}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* ──── PASSWORD TAB ──── */}
            {tab === 'password' && (
              <form onSubmit={handlePasswordLogin} noValidate>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      شماره موبایل
                    </label>
                    <input
                      type="tel"
                      value={pwPhone}
                      onChange={(e) => setPwPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      dir="ltr"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      رمز عبور
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور خود را وارد کنید"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPw ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="text-left mt-1.5">
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        فراموشی رمز عبور؟
                      </Link>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  )}
                  {loading ? 'در حال ورود...' : 'ورود'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* فوتر کارت */}
        <p className="text-center text-sm text-gray-500 mt-4">
          حساب ندارید؟{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            ثبت‌نام
          </Link>
        </p>
      </div>
    </div>
  )
}
