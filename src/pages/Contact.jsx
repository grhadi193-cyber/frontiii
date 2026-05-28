import React, { useEffect, useState } from 'react'
import { getSettings } from '../api/django.js'
import ToastContainer, { useToast } from '../components/Toast.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

function InfoItem({ icon, label, value, href }) {
  const content = (
    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-gray-800 font-semibold text-sm break-all">{value || '—'}</p>
      </div>
    </div>
  )
  if (href && value) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }
  return content
}

export default function Contact() {
  const [settings, setSettings] = useState(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const [form, setForm] = useState({ name: '', mobile: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const { toasts, showToast } = useToast()

  useEffect(() => {
    getSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))
      .finally(() => setLoadingSettings(false))
  }, [])

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'نام الزامی است.'
    if (!/^09[0-9]{9}$/.test(form.mobile)) errs.mobile = 'شماره موبایل معتبر نیست.'
    if (form.message.trim().length < 10) errs.message = 'پیام باید حداقل ۱۰ کاراکتر باشد.'
    return errs
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    // فعلاً فقط UI با Toast (بدون API)
    await new Promise((r) => setTimeout(r, 800))
    showToast('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.', 'success')
    setForm({ name: '', mobile: '', message: '' })
    setErrors({})
    setSubmitting(false)
  }

  const phone     = settings?.support_phone || null
  const instagram = settings?.social_instagram || null
  const telegram  = settings?.social_telegram || null
  const address   = settings?.address || 'تهران، خیابان ولیعصر، پلاک ۱۲۳'

  return (
    <>
      <ToastContainer toasts={toasts} />
      <main className="min-h-[60vh]">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-16 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl font-black mb-3">تماس با ما</h1>
            <p className="text-white/75 text-base">
              سوال، پیشنهاد یا نیاز به پشتیبانی دارید؟ با ما در ارتباط باشید.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">

            {/* فرم تماس */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                ارسال پیام
              </h2>
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* نام */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    نام و نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="مثال: علی رضایی"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors
                      ${errors.name
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 focus:border-primary focus:bg-white'
                      }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                </div>

                {/* موبایل */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    شماره موبایل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="09xxxxxxxxx"
                    dir="ltr"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors text-left
                      ${errors.mobile
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 focus:border-primary focus:bg-white'
                      }`}
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1.5">{errors.mobile}</p>}
                </div>

                {/* پیام */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    پیام <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="پیام خود را بنویسید..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors resize-none
                      ${errors.message
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : 'border-gray-200 bg-gray-50 focus:border-primary focus:bg-white'
                      }`}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1.5">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                      در حال ارسال...
                    </>
                  ) : 'ارسال پیام'}
                </button>
              </form>
            </div>

            {/* اطلاعات تماس */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-6 bg-accent rounded-full" />
                  اطلاعات تماس
                </h2>
                {loadingSettings ? (
                  <LoadingSpinner size="sm" text="بارگذاری اطلاعات..." />
                ) : (
                  <div className="flex flex-col gap-3">
                    <InfoItem
                      icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                      label="تلفن پشتیبانی"
                      value={phone}
                      href={phone ? `tel:${phone}` : null}
                    />
                    <InfoItem
                      icon={<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      label="آدرس دفتر مرکزی"
                      value={settings?.address || address}
                    />
                    {instagram && (
                      <InfoItem
                        icon={<svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>}
                        label="اینستاگرام"
                        value={instagram}
                        href={`https://instagram.com/${instagram.replace('@', '')}`}
                      />
                    )}
                    {telegram && (
                      <InfoItem
                        icon={<svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>}
                        label="تلگرام"
                        value={telegram}
                        href={`https://t.me/${telegram.replace('@', '')}`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* نقشه */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center px-6">
                  <svg className="w-10 h-10 text-primary/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {settings?.address || address}
                  </p>
                </div>
              </div>

              {/* ساعت کاری */}
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ساعات پاسخگویی
                </h3>
                <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>شنبه تا چهارشنبه</span>
                    <span className="font-medium text-gray-800">۸:۰۰ – ۱۷:۰۰</span>
                  </div>
                  <div className="flex justify-between">
                    <span>پنج‌شنبه</span>
                    <span className="font-medium text-gray-800">۸:۰۰ – ۱۳:۰۰</span>
                  </div>
                  <div className="flex justify-between">
                    <span>جمعه و تعطیلات</span>
                    <span className="text-red-400 font-medium">تعطیل</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
