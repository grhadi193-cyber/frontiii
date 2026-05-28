import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OtpInput from '../components/OtpInput.jsx'
import CountdownTimer from '../components/CountdownTimer.jsx'
import { forgotPassword, resetPassword } from '../api/django.js'

function validatePhone(phone) {
  return /^09[0-9]{9}$/.test(phone)
}

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep]         = useState(1) // 1=شماره، 2=کد+رمز جدید
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [timerExpired, setTimerExpired] = useState(false)
  const timerRestartRef = useRef(null)

  function clearMessages() { setError(''); setSuccess('') }

  async function handleSendCode(e) {
    e.preventDefault()
    clearMessages()
    if (!validatePhone(phone)) {
      setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
      return
    }
    setLoading(true)
    try {
      await forgotPassword(phone)
      setStep(2)
      setOtp('')
      setTimerExpired(false)
      setSuccess('کد تأیید ارسال شد')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    clearMessages()
    setLoading(true)
    try {
      await forgotPassword(phone)
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

  async function handleReset(e) {
    e.preventDefault()
    clearMessages()
    if (otp.length < 6) { setError('کد ۶ رقمی را کامل وارد کنید'); return }
    if (newPw.length < 6) { setError('رمز عبور باید حداقل ۶ کاراکتر باشد'); return }
    if (newPw !== confirmPw) { setError('تکرار رمز عبور مطابقت ندارد'); return }
    setLoading(true)
    try {
      await resetPassword(phone, otp, newPw)
      setSuccess('رمز عبور با موفقیت تغییر کرد. در حال انتقال...')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* هدر */}
          <div className="bg-gradient-to-l from-primary to-indigo-600 px-6 py-7 text-center">
            <div className="w-13 h-13 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-white text-lg font-bold">بازیابی رمز عبور</h1>
          </div>

          <div className="p-6">

            {/* پیام‌ها */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                {success}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendCode} noValidate>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  شماره موبایل ثبت‌شده
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition mb-4"
                />
                <button
                  type="submit"
                  disabled={loading || phone.length < 11}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  {loading ? 'در حال ارسال...' : 'ارسال کد تأیید'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} noValidate>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    کد به <span dir="ltr" className="font-mono font-bold text-gray-800">{phone}</span> ارسال شد
                  </span>
                  <button type="button" onClick={() => { setStep(1); clearMessages() }} className="text-xs text-primary hover:underline">
                    ویرایش شماره
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    کد تأیید
                  </label>
                  <OtpInput value={otp} onChange={setOtp} disabled={loading} hasError={!!error} />
                </div>

                <div className="flex items-center justify-center gap-2 mb-5 text-sm">
                  {!timerExpired ? (
                    <>
                      <span className="text-gray-400">اعتبار کد:</span>
                      <CountdownTimer seconds={120} onExpire={() => setTimerExpired(true)} restartRef={timerRestartRef} />
                    </>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={loading} className="text-primary font-medium hover:underline disabled:opacity-60">
                      ارسال مجدد کد
                    </button>
                  )}
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور جدید</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="حداقل ۶ کاراکتر"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition pl-10"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">تکرار رمز عبور</label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="رمز عبور را مجدداً وارد کنید"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  {loading ? 'در حال تغییر رمز...' : 'ذخیره رمز جدید'}
                </button>
              </form>
            )}

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-gray-500 hover:text-primary">
                ← بازگشت به صفحه ورود
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
