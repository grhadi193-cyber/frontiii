import React, { useEffect, useState } from 'react'
import { getSiteConfig, pbImageUrl } from '../api/pocketbase.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const FALLBACK_FEATURES = [
  { icon: '📍', title: 'ردیابی لحظه‌ای', desc: 'مکان دستگاه را در هر لحظه روی نقشه مشاهده کنید.' },
  { icon: '🔔', title: 'هشدار هوشمند', desc: 'اعلان‌های فوری برای ورود/خروج از محدوده جغرافیایی.' },
  { icon: '📊', title: 'گزارش‌گیری پیشرفته', desc: 'تاریخچه مسیر، سرعت و توقف به صورت کامل.' },
  { icon: '👥', title: 'مدیریت ناوگان', desc: 'پایش هم‌زمان چندین دستگاه از یک داشبورد واحد.' },
  { icon: '📱', title: 'اپلیکیشن موبایل', desc: 'دسترسی کامل از طریق اپ اندروید و iOS.' },
  { icon: '🔒', title: 'امنیت داده', desc: 'رمزنگاری کامل اطلاعات و پشتیبان‌گیری ابری.' },
]

function ScreenshotSlider({ screenshots }) {
  const [current, setCurrent] = useState(0)
  if (!screenshots || screenshots.length === 0) return null

  const prev = () => setCurrent((c) => (c - 1 + screenshots.length) % screenshots.length)
  const next = () => setCurrent((c) => (c + 1) % screenshots.length)

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 bg-gray-900">
      <img
        key={current}
        src={screenshots[current]}
        alt={`اسکرین‌شات نرم‌افزار ${current + 1}`}
        className="w-full object-contain max-h-[500px] transition-opacity duration-300"
        loading="lazy"
      />

      {screenshots.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 flex items-center justify-center transition-colors"
            aria-label="قبلی"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 flex items-center justify-center transition-colors"
            aria-label="بعدی"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {screenshots.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-5' : 'bg-white/50'}`}
                aria-label={`اسکرین‌شات ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PricingCard({ plan }) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 border-2 flex flex-col gap-4 transition-shadow hover:shadow-xl ${plan.featured ? 'border-primary shadow-lg shadow-primary/15' : 'border-gray-100'}`}>
      {plan.featured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">
          محبوب‌ترین
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
        {plan.desc && <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>}
      </div>
      {plan.price != null && (
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-black ${plan.featured ? 'text-primary' : 'text-gray-800'}`}>
            {Number(plan.price).toLocaleString('fa-IR')}
          </span>
          <span className="text-sm text-gray-400">تومان / ماه</span>
        </div>
      )}
      {plan.features && plan.features.length > 0 && (
        <ul className="flex flex-col gap-2 mt-2">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Software() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSiteConfig()
      .then((data) => setConfig(data))
      .catch(() => setConfig(null))
      .finally(() => setLoading(false))
  }, [])

  const softwareUrl = config?.software_url || '#'
  const softwareTitle = config?.software_title || 'سامانه مدیریت ردیابی ATI'
  const softwareDesc = config?.software_description || 'نرم‌افزار حرفه‌ای مدیریت ناوگان و ردیابی GPS برای کسب‌وکارهای کوچک تا سازمانی. با واسط کاربری ساده، قدرت‌مند و بهینه برای دستگاه‌های موبایل و دسکتاپ.'

  // screenshots: اگر در config آرایه‌ای از تصاویر بود
  const screenshots = (() => {
    if (!config) return []
    if (Array.isArray(config.screenshots) && config.screenshots.length) {
      return config.screenshots.map((f) => pbImageUrl(config, f))
    }
    return []
  })()

  const features = (() => {
    if (config?.software_features && Array.isArray(config.software_features)) {
      return config.software_features
    }
    return FALLBACK_FEATURES
  })()

  const pricing = (() => {
    if (config?.pricing_plans && Array.isArray(config.pricing_plans)) {
      return config.pricing_plans
    }
    return null
  })()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="در حال بارگذاری..." />
      </div>
    )
  }

  return (
    <main className="min-h-[60vh]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-5 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            نرم‌افزار تحت وب
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">{softwareTitle}</h1>
          <p className="text-white/80 text-base leading-relaxed mb-8">{softwareDesc}</p>
          <a
            href={softwareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-accent/30 transition-colors text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            ورود به سامانه
          </a>
        </div>
      </section>

      {/* اسلایدر اسکرین‌شات */}
      {screenshots.length > 0 && (
        <section className="bg-gray-900 py-14">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-white/60 text-sm font-medium mb-6 uppercase tracking-widest">نگاهی به نرم‌افزار</p>
            <ScreenshotSlider screenshots={screenshots} />
          </div>
        </section>
      )}

      {/* ویژگی‌ها */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">امکانات نرم‌افزار</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              همه آنچه برای مدیریت هوشمند ناوگان و ردیابی دارایی‌های خود نیاز دارید
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feat.icon || '⚙️'}</div>
                <h3 className="text-gray-800 font-bold mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قیمت‌گذاری */}
      {pricing && pricing.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">پلان‌های اشتراک</h2>
              <p className="text-gray-500 text-sm">متناسب با اندازه و نیاز کسب‌وکار شما</p>
            </div>
            <div className={`grid gap-6 ${pricing.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : pricing.length >= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 max-w-sm mx-auto'}`}>
              {pricing.map((plan, idx) => <PricingCard key={idx} plan={plan} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA پایین */}
      <section className="py-14 bg-gradient-to-r from-primary-dark to-primary text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-xl sm:text-2xl font-black mb-4">آماده شروع هستید؟</h3>
          <p className="text-white/75 text-sm mb-7 leading-relaxed">
            همین حالا وارد سامانه شوید و تجربه ردیابی هوشمند را آغاز کنید.
          </p>
          <a
            href={softwareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
          >
            ورود به سامانه
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  )
}
