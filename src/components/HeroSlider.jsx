import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getBanners, pbImageUrl } from '../api/pocketbase.js'

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    title: 'ردیابی هوشمند',
    title_highlight: 'کنترل بدون محدودیت',
    subtitle: 'با ردیابی پیشرفته، موقعیت، مسیر، مسافت، مصرف و امنیت را در اختیار بگیرید. سیستم‌های حرفه‌ای برای خودرو، ناوگان و تجهیزات.',
    badge_text: 'سیستم ردیابی هوشمند',
    cta_text: 'مشاهده محصولات',
    cta_link: '/products',
    cta_secondary: 'دانلود اپلیکیشن',
    cta_secondary_link: '#app',
    image: null,
  },
]

// ── SVG Icons ────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const HeadsetIcon = () => (
  <svg className="w-4 h-4 text-[var(--color-primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const ChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

// ── Hero Visual ───────────────────────────────────────────────
// اگه تصویر داشت، اون رو با یه قاب زیبا نشون بده
// وگرنه همون MockMap رو نشون بده
function PhoneMockup({ imageUrl }) {
  if (imageUrl) {
    return (
      <div className="relative w-full max-w-[480px] h-[520px] lg:h-[580px] mx-auto lg:mr-auto lg:ml-0">
        {/* Glow behind image */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.2)_0%,transparent_70%)] animate-pulse-glow" />

        {/* Main image with glossy frame */}
        <div className="absolute inset-8 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] border border-white/10">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          {/* Overlay gloss */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        </div>

        {/* Floating tracker card */}
        <div className="absolute top-10 -left-2 lg:-left-8 z-30 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-xl animate-float-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white" /></svg>
            </div>
            <div>
              <p className="text-white/50 text-[10px]">موقعیت فعلی</p>
              <p className="text-white text-xs font-bold">تهران، ایران</p>
            </div>
          </div>
        </div>

        {/* Speed card */}
        <div className="absolute bottom-16 -right-2 lg:-right-8 z-30 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-xl animate-float-pin">
          <div className="text-center">
            <p className="text-[var(--color-accent)] text-2xl font-black">۴۵</p>
            <p className="text-white/50 text-[10px]">km/h</p>
          </div>
        </div>

        {/* Decorative dots */}
        <div className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-[rgba(79,70,229,0.4)] animate-float-card" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[30%] right-[5%] w-2 h-2 rounded-full bg-[rgba(249,115,22,0.5)] animate-float-card" style={{ animationDelay: '1.2s' }} />
      </div>
    )
  }

  // ── Default SVG Mockup (بدون تصویر سفارشی) ──────────────────
  return (
    <div className="relative w-full max-w-[420px] h-[520px] lg:h-[580px] mx-auto lg:mr-auto lg:ml-0">
      {/* Base glow */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.12)_0%,transparent_70%)] animate-pulse-glow" />

      {/* Phone frame */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[260px] h-[440px] lg:w-[300px] lg:h-[480px] rounded-[36px] bg-[rgba(15,10,30,0.85)] border border-[rgba(79,70,229,0.3)] backdrop-blur-sm shadow-2xl shadow-[rgba(79,70,229,0.2)] z-10">
        {/* Inner bezel */}
        <div className="absolute inset-2 rounded-[28px] overflow-hidden bg-gradient-to-b from-[#1a1640] to-[#0d0b1e]">
          {/* Status bar */}
          <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-20">
            <span className="text-white/40 text-[10px]">۱۲:۳۰</span>
            <div className="flex gap-1">
              <div className="w-3 h-2 rounded-sm border border-white/30" />
              <div className="w-0.5 h-2 bg-white/30 rounded-full" />
            </div>
          </div>

          {/* Map grid */}
          <div className="absolute inset-0">
            {/* Horizontal grid lines */}
            {[...Array(8)].map((_, i) => (
              <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-[rgba(79,70,229,0.12)]" style={{ top: `${(i + 1) * 12.5}%` }} />
            ))}
            {/* Vertical grid lines */}
            {[...Array(6)].map((_, i) => (
              <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-[rgba(79,70,229,0.12)]" style={{ left: `${(i + 1) * 16.6}%` }} />
            ))}
            {/* Roads */}
            <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-[rgba(79,70,229,0.25)]" />
            <div className="absolute top-[65%] left-0 right-0 h-[2px] bg-[rgba(79,70,229,0.2)]" />
            <div className="absolute top-0 bottom-0 left-[40%] w-[2px] bg-[rgba(79,70,229,0.25)]" />
            <div className="absolute top-0 bottom-0 left-[70%] w-[2px] bg-[rgba(79,70,229,0.2)]" />
          </div>

          {/* Center location dot with pulse */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 -m-4 rounded-full border border-[rgba(249,115,22,0.2)] animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 w-12 h-12 -m-2 rounded-full border border-[rgba(249,115,22,0.3)] animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] shadow-[0_0_20px_rgba(249,115,22,0.6)] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-transparent flex items-center px-4">
            <span className="text-white/80 text-xs">سرعت: ۴۵ کیلومتر</span>
          </div>

        </div>

        {/* Home bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Car element - simplified silhouette */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-[220px] lg:w-[260px]">
        <svg viewBox="0 0 260 120" fill="none" className="w-full drop-shadow-2xl">
          <defs>
            <linearGradient id="carGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          {/* Car body */}
          <path d="M20 80 Q20 60 40 55 L70 48 Q90 25 130 22 Q170 25 190 48 L220 55 Q240 60 240 80 L240 95 Q240 100 235 100 L25 100 Q20 100 20 95 Z" fill="url(#carGrad)" />
          {/* Windshield */}
          <path d="M75 50 Q95 30 130 28 Q165 30 185 50 L180 52 Q160 35 130 33 Q100 35 80 52 Z" fill="rgba(79,70,229,0.3)" />
          {/* Headlight */}
          <ellipse cx="45" cy="72" rx="8" ry="5" fill="rgba(249,115,22,0.5)" />
          {/* Taillight */}
          <ellipse cx="215" cy="72" rx="6" ry="4" fill="rgba(239,68,68,0.5)" />
          {/* Grille */}
          <rect x="55" y="78" width="30" height="4" rx="2" fill="rgba(79,70,229,0.4)" />
        </svg>
      </div>

      {/* Floating location pin */}
      <div className="absolute top-[25%] -right-2 lg:right-0 z-30 animate-float-pin">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <path d="M28 8C20.268 8 14 14.268 14 22C14 33 28 48 28 48C28 48 42 33 42 22C42 14.268 35.732 8 28 8Z" fill="var(--color-accent)" filter="drop-shadow(0 0 12px rgba(249,115,22,0.5))" />
          <circle cx="28" cy="22" r="6" fill="white" />
        </svg>
      </div>

      {/* Decorative dots */}
      <div className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-[rgba(79,70,229,0.3)] animate-float-card" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-[30%] right-[5%] w-2 h-2 rounded-full bg-[rgba(249,115,22,0.4)] animate-float-card" style={{ animationDelay: '1.2s' }} />
      <div className="absolute top-[60%] left-[5%] w-2.5 h-2.5 rounded-full bg-[rgba(79,70,229,0.25)] animate-float-card" style={{ animationDelay: '0.8s' }} />
    </div>
  )
}

// ── Slide Content ────────────────────────────────────────────
function SlideContent({ slide, active }) {
  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-bl from-[#0F0A1E] via-[#1E1B4B] to-[#312E81]" />

          {/* Floating orbs */}
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center pt-[72px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
              {/* Left: Device mockup */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="order-2 lg:order-1"
              >
                <PhoneMockup imageUrl={slide.image ? pbImageUrl(slide, slide.image) : null} />
              </motion.div>

              {/* Right: Text (RTL-aligned) */}
              <div className="order-1 lg:order-2 text-right">
                {/* Badge */}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(79,70,229,0.15)] text-sm font-medium text-[var(--color-primary-light)] mb-5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  {slide.badge_text || 'سیستم ردیابی هوشمند'}
                </motion.span>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-5"
                >
                  <span className="text-white block">{slide.title || 'ردیابی هوشمند'}</span>
                  {slide.title_highlight && (
                    <span className="text-[var(--color-accent)] block mt-1">{slide.title_highlight}</span>
                  )}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  className="text-base sm:text-lg text-white/70 leading-8 mb-8 max-w-lg mr-0 ml-auto"
                >
                  {slide.subtitle || 'با ردیابی پیشرفته، موقعیت، مسیر، مسافت، مصرف و امنیت را در اختیار بگیرید.'}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex flex-row-reverse flex-wrap gap-4"
                >
                  {slide.cta_text && (
                    <Link
                      to={slide.cta_link || '/products'}
                      className="px-7 py-3.5 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg shadow-[rgba(79,70,229,0.4)] hover:shadow-[rgba(79,70,229,0.6)] hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {slide.cta_text}
                    </Link>
                  )}
                  {slide.cta_secondary && (
                    <a
                      href={slide.cta_secondary_link || '#app'}
                      className="px-7 py-3.5 bg-transparent border-[1.5px] border-white/30 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                    >
                      {slide.cta_secondary}
                    </a>
                  )}
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="flex flex-row-reverse gap-6 lg:gap-8 mt-8"
                >
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <ShieldIcon />
                    <span>امنیت بالا</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <ClockIcon />
                    <span>آنلاین و آفلاین</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <HeadsetIcon />
                    <span>پشتیبانی ۲۴/۷</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Component ───────────────────────────────────────────
export default function HeroSlider() {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBanners().then((data) => {
      setSlides(data.length > 0 ? data : DEFAULT_SLIDES)
      setLoading(false)
    })
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  if (loading) {
    return (
      <section className="relative min-h-[640px] lg:min-h-[700px] bg-gradient-to-bl from-[#0F0A1E] via-[#1E1B4B] to-[#312E81] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </section>
    )
  }

  return (
    <section className="relative min-h-[640px] lg:min-h-[700px] overflow-hidden">
      {slides.map((slide, idx) => (
        <SlideContent key={slide.id} slide={slide} active={idx === current} />
      ))}

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={next}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={prev}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-8 h-2.5 bg-[var(--color-accent)]'
                  : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`اسلاید ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
