import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider.jsx'
import PartnersMarquee from '../components/PartnersMarquee.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import StatsCounter from '../components/StatsCounter.jsx'
import ToastContainer, { useToast } from '../components/Toast.jsx'
import { PageSEO } from '../components/seo/SEO.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { getSettings } from '../api/django.js'
import { getSiteConfig } from '../api/pocketbase.js'
import { motion } from 'framer-motion'

// ── Feature Icons ────────────────────────────────────────────
const FeatureIcons = {
  zap: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  shield: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  mapPin: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  globe: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chart: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
  ),
  users: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  route: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  bell: () => (
    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
}

// ── About Section ────────────────────────────────────────────
function AboutSection({ config, aboutText }) {
  const features = [
    { icon: 'zap', title: 'نصب سریع', desc: 'نصب و راه‌اندازی در کمتر از ۲۴ ساعت' },
    { icon: 'shield', title: 'پشتیبانی فنی', desc: 'پشتیبانی ۲۴ ساعته در ۷ روز هفته' },
    { icon: 'mapPin', title: 'دقت بالا', desc: 'موقعیت‌یابی با دقت ۲ متر' },
    { icon: 'globe', title: 'سراسر کشور', desc: 'پوشش کامل در سراسر ایران' },
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text - right side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <SectionTitle
              badge="درباره ما"
              title={config?.about_title || 'ما امنیت و آرامش را با تکنولوژی ترکیب کردیم'}
              subtitle=""
              center={false}
            />

            <p className="text-[var(--color-text-secondary)] leading-8 mb-8 text-base">
              {aboutText || 'شرکت ATI Farzam Iranian با بیش از ۱۵ سال تجربه در طراحی و تولید سیستم‌های ردیابی GPS، یکی از پیشروان این صنعت در ایران است. ما با تکیه بر دانش فنی بومی و استفاده از فناوری‌های روز دنیا، راهکارهای جامع مدیریت ناوگان را برای کسب‌وکارهای کوچک تا بزرگ ارائه می‌دهیم.'}
            </p>

            {/* Feature cards grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((f) => {
                const IconComp = FeatureIcons[f.icon]
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <IconComp />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-text-primary)] text-sm">{f.title}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{f.desc}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors shadow-md shadow-[var(--color-primary)]/20"
            >
              بیشتر درباره ما
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {/* Card composition - left side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center h-[400px] lg:h-[450px]"
          >
            {/* Secondary card (back) */}
            <div className="absolute w-[320px] h-[240px] lg:w-[380px] lg:h-[280px] rounded-3xl bg-white border border-[var(--color-border)] shadow-xl"
              style={{ transform: 'translate(24px, 24px) rotate(3deg)' }} />

            {/* Main card (front) */}
            <div className="absolute w-[340px] h-[260px] lg:w-[400px] lg:h-[300px] rounded-3xl bg-gradient-to-br from-[#1E1B4B] to-[#312E81] shadow-[0_25px_60px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center animate-float-card z-10"
              style={{ transform: 'rotate(-6deg)' }}>
              <svg className="w-12 h-12 mb-4" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="var(--color-accent)" strokeWidth="3" />
                <circle cx="24" cy="24" r="10" fill="var(--color-accent)" />
                <circle cx="24" cy="24" r="4" fill="white" />
              </svg>
              <span className="text-white text-2xl lg:text-3xl font-black tracking-wide">ATI FARZAM</span>
              <span className="text-white/60 text-sm mt-1">IRANIAN</span>
            </div>

            {/* Accent card */}
            <div className="absolute bottom-8 left-4 lg:left-8 w-[100px] h-[140px] rounded-2xl bg-[var(--color-accent)] shadow-lg flex flex-col items-center justify-center z-20 animate-float-card"
              style={{ animationDelay: '1s' }}>
              <svg className="w-10 h-10 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white font-black text-xl">۵+</span>
              <span className="text-white/80 text-xs mt-0.5">سال</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Products Section ─────────────────────────────────────────
function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden animate-pulse">
          <div className="aspect-[16/10] bg-[var(--color-bg-body)]" />
          <div className="p-6 space-y-3">
            <div className="h-5 bg-[var(--color-bg-body)] rounded-lg w-3/4" />
            <div className="h-4 bg-[var(--color-bg-body)] rounded-lg w-1/2" />
            <div className="h-10 bg-[var(--color-bg-body)] rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductsSection() {
  const { data: productsData, isLoading: loading, error } = useProducts({ page: 1, pageSize: 6 })
  const products = productsData?.items || []
  const featuredProducts = products.slice(0, 2)

  return (
    <section className="py-24 bg-[var(--color-bg-body)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          badge="محصولات سخت‌افزاری"
          title="ردیاب‌های حرفه‌ای GPS"
        />

        {loading && <ProductsSkeleton />}

        {error && !loading && (
          <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl">
            <p className="font-medium">خطا در بارگذاری محصولات</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {!loading && !error && featuredProducts.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)] bg-white rounded-2xl border border-[var(--color-border)]">
            محصولی یافت نشد
          </div>
        )}

        {!loading && !error && featuredProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} imageUrl={p.primaryImage} variant="featured" />
              ))}
            </div>
            <div className="text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200"
              >
                مشاهده همه محصولات
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

// ── Software Section ─────────────────────────────────────────
function SoftwareSection({ config }) {
  const defaultFeatures = [
    { icon: 'chart', title: 'گزارش‌گیری پیشرفته', desc: 'گزارش کامل مسافت، سرعت و وضعیت دستگاه' },
    { icon: 'users', title: 'چند کاربره', desc: 'مدیریت تیم با سطوح دسترسی متفاوت' },
    { icon: 'route', title: 'تاریخچه مسیر', desc: 'بررسی مسیر طی‌شده تا ۱۸۰ روز گذشته' },
    { icon: 'bell', title: 'هشدار لحظه‌ای', desc: 'اعلان فوری برای رویدادهای مهم' },
  ]

  let features = defaultFeatures
  try {
    if (config?.software_features) {
      const parsed = typeof config.software_features === 'string'
        ? JSON.parse(config.software_features)
        : config.software_features
      if (Array.isArray(parsed) && parsed.length > 0) {
        features = parsed.map((f, i) => ({ ...defaultFeatures[i], ...f })).filter(Boolean)
      }
    }
  } catch (_) { /* use defaults */ }

  const panelLink = config?.panel_url || '#'

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text - right side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <SectionTitle
              badge="نرم‌افزار مدیریت و ردیابی"
              title={config?.software_title || 'کنترل همه چیز در یک پلتفرم هوشمند'}
              subtitle={config?.software_subtitle || ''}
              center={false}
            />

            <div className="space-y-4 mb-8">
              {features.map((f, i) => {
                const IconComp = FeatureIcons[f.icon] || FeatureIcons.chart
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-[var(--color-primary)]/5 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <IconComp />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-text-primary)]">{f.title}</div>
                      <div className="text-sm text-[var(--color-text-muted)] mt-0.5">{f.desc}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex flex-row-reverse flex-wrap gap-4">
              <Link
                to="/software"
                className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-dark)] transition-colors shadow-md shadow-[var(--color-primary)]/20"
              >
                بیشتر بدانید
              </Link>
              <a
                href={panelLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2"
              >
                ورود به سامانه
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Laptop mockup - left side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-[500px]">
              {/* Laptop frame */}
              <div className="bg-[#1a1a2e] rounded-2xl p-3 shadow-2xl">
                {/* Camera */}
                <div className="bg-[#0f0f1a] rounded-t-xl h-5 flex items-center justify-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                </div>
                {/* Screen */}
                <div className="bg-gradient-to-br from-[var(--color-primary)]/90 to-[var(--color-primary-dark)] rounded-xl aspect-video flex flex-col items-center justify-center p-6 relative overflow-hidden">
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-8 grid-rows-5 h-full w-full gap-px">
                      {[...Array(40)].map((_, i) => (
                        <div key={i} className="bg-white rounded-sm" />
                      ))}
                    </div>
                  </div>
                  {/* Map content */}
                  <svg viewBox="0 0 100 60" className="w-24 h-14 mb-3 relative z-10" fill="none">
                    <path d="M10 50 Q25 20 40 35 Q55 50 70 25 Q85 0 90 15"
                      stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <circle cx="40" cy="35" r="3" fill="var(--color-accent)" />
                    <circle cx="70" cy="25" r="3" fill="var(--color-accent)" />
                    <circle cx="25" cy="30" r="2" fill="white" opacity="0.7" />
                    <circle cx="55" cy="40" r="2" fill="white" opacity="0.5" />
                  </svg>
                  <div className="text-white text-xs font-bold opacity-80 relative z-10">پنل مدیریت ناوگان</div>
                  <div className="flex gap-3 mt-3 relative z-10">
                    {['آنلاین: ۲۴', 'توقف: ۳', 'آفلاین: ۱'].map((t) => (
                      <div key={t} className="bg-white/10 rounded-lg px-2 py-1 text-white text-[10px]">{t}</div>
                    ))}
                  </div>
                </div>
                {/* Bottom bezel */}
                <div className="h-3 bg-[#0f0f1a] rounded-b-xl mt-2" />
              </div>
              {/* Keyboard base */}
              <div className="h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl mx-8 shadow-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Mobile App Section ───────────────────────────────────────
function MobileAppSection({ config }) {
  const googlePlayUrl = config?.google_play_url || '#'
  const appStoreUrl = config?.app_store_url || '#'

  const defaultFeatures = [
    'ردیابی زنده روی نقشه',
    'هشدارهای فوری پوش',
    'گزارش‌گیری آسان',
    'رابط کاربری ساده و سریع',
  ]

  let features = defaultFeatures
  try {
    if (config?.app_features) {
      const parsed = typeof config.app_features === 'string'
        ? JSON.parse(config.app_features)
        : config.app_features
      if (Array.isArray(parsed) && parsed.length > 0) features = parsed
    }
  } catch (_) { /* use defaults */ }

  return (
    <section className="py-24 bg-gradient-to-br from-[var(--color-bg-body)] to-[#EEF2FF]" id="app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Phone mockup - left side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center relative"
          >
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] rounded-full bg-[var(--color-primary)]/10 blur-[80px] pointer-events-none" />

            {/* Phone frame */}
            <div className="relative w-[260px] bg-[var(--color-bg-dark)] rounded-[40px] p-3 shadow-2xl border-[6px] border-[#1E1B4B]">
              {/* Notch */}
              <div className="w-20 h-5 bg-[#1a1a2e] rounded-full mx-auto mb-2" />
              {/* Screen */}
              <div className="bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-[32px] h-[420px] flex flex-col items-center justify-center p-4 overflow-hidden relative">
                {/* Status bar */}
                <div className="absolute top-3 w-full px-4 flex justify-between text-white text-[10px] opacity-60">
                  <span>۱۲:۳۰</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                  </span>
                </div>

                {/* GPS target */}
                <svg viewBox="0 0 80 80" className="w-16 h-16 mb-4 relative z-10" fill="none">
                  <circle cx="40" cy="40" r="35" stroke="white" strokeWidth="1" opacity="0.2" />
                  <circle cx="40" cy="40" r="25" stroke="white" strokeWidth="1" opacity="0.3" />
                  <circle cx="40" cy="40" r="12" fill="white" opacity="0.9" />
                  <circle cx="40" cy="40" r="5" fill="var(--color-accent)" />
                  <path d="M40 10 L40 18 M40 62 L40 70 M10 40 L18 40 M62 40 L70 40"
                    stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                </svg>

                <div className="text-white text-xs font-bold mb-1 relative z-10">ردیابی زنده</div>
                <div className="text-white/60 text-[10px] relative z-10">تهران، خیابان ولیعصر</div>

                {/* Speed card */}
                <div className="mt-6 w-full bg-white/10 rounded-xl p-3 text-center relative z-10">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="text-white text-xs">
                      سرعت: <span className="font-bold">۴۵</span> کیلومتر/ساعت
                    </div>
                  </div>
                </div>

                {/* Decorative dots on screen */}
                <div className="absolute top-20 left-6 w-2 h-2 rounded-full bg-[var(--color-accent)]/60" />
                <div className="absolute bottom-24 right-8 w-1.5 h-1.5 rounded-full bg-white/30" />
              </div>
              {/* Home indicator */}
              <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mt-2" />
            </div>
          </motion.div>

          {/* Text - right side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <SectionTitle
              badge="اپلیکیشن موبایل"
              title={config?.app_title || 'همراه شما در هر لحظه و مکان'}
              subtitle={config?.app_subtitle || 'با اپلیکیشن موبایل، کنترل ناوگان خود را در جیب داشته باشید'}
              center={false}
              badgeColor="#F97316"
            />

            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="flex items-center gap-3 text-[var(--color-text-secondary)]"
                >
                  <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-xs flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {f}
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-row-reverse flex-wrap gap-4">
              {/* Google Play */}
              <a
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-[var(--color-text-primary)] text-white rounded-xl hover:bg-black transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                  <path d="M3.18 23.85C2.5 23.48 2 22.71 2 21.86V2.14C2 1.29 2.5.52 3.18.15L13.83 12 3.18 23.85zM16.5 8.5l-2.28-1.32L6.66 12l7.56 4.82 2.28-1.32L19.48 12 16.5 8.5zM4.34 1.1L14.5 7.5 12.22 9.78 4.34 1.1zM4.34 22.9l7.88-8.68L14.5 16.5 4.34 22.9z" />
                </svg>
                <div>
                  <div className="text-[10px] text-white/50">دریافت از</div>
                  <div className="font-bold text-sm">Google Play</div>
                </div>
              </a>
              {/* App Store */}
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-[var(--color-text-primary)] text-white rounded-xl hover:bg-black transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-[10px] text-white/50">دریافت از</div>
                  <div className="font-bold text-sm">App Store</div>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Newsletter / CTA Section ─────────────────────────────────
function NewsletterSection({ showToast }) {
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    if (!phone || phone.length < 10) {
      showToast('لطفاً شماره موبایل معتبر وارد کنید', 'error')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      showToast('عضویت شما با موفقیت ثبت شد', 'success')
      setPhone('')
      setSubmitting(false)
    }, 800)
  }

  return (
    <section className="w-full py-20 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-4 text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
          از جدیدترین محصولات و اخبار ما با خبر شوید
        </h2>
        <p className="text-white/80 mb-8">
          اولین نفری باشید که از جدیدترین محصولات و تخفیف‌ها باخبر می‌شود
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            dir="ltr"
            className="flex-1 px-5 py-3.5 rounded-xl bg-white/15 border border-white/30 text-white placeholder-white/60 font-medium focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all text-center backdrop-blur-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3.5 bg-white text-[var(--color-accent)] font-bold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-70 flex-shrink-0"
          >
            {submitting ? '...' : 'عضویت'}
          </button>
        </div>
      </motion.div>
    </section>
  )
}

// ── Main Home Component ──────────────────────────────────────
export default function Home() {
  const [aboutText, setAboutText] = useState('')
  const [siteConfig, setSiteConfig] = useState(null)
  const { toasts, showToast } = useToast()

  // Stats from config
  const statsData = siteConfig
    ? [
        { value: siteConfig.stats_uptime || 99.9, label: 'آپتایم سرویس', suffix: '%', decimals: 1 },
        { value: siteConfig.stats_users || 5000, label: 'کاربر فعال', prefix: '+' },
        { value: siteConfig.stats_customers || 2000, label: 'مشتری راضی', prefix: '+' },
        { value: siteConfig.stats_years || 15, label: 'سال فعالیت', prefix: '+' },
        { value: 24, label: 'پشتیبانی فنی', suffix: '/۷', isStatic: true },
      ]
    : null

  useEffect(() => {
    getSettings()
      .then((data) => setAboutText(data?.about_us || ''))
      .catch(() => {})

    getSiteConfig()
      .then((cfg) => setSiteConfig(cfg))
      .catch(() => {})
  }, [])

  return (
    <div className="w-full overflow-x-hidden">
      <PageSEO
        title="ATI Farzam Iranian — ردیاب GPS و مدیریت ناوگان"
        description="پیشرو در فناوری ردیابی GPS ایران. خرید ردیاب آنلاین، آفلاین و ماهواره‌ای با گارانتی ۱۲ ماهه. نرم‌افزار مدیریت ناوگان و اپلیکیشن موبایل."
      />
      <ToastContainer toasts={toasts} />

      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Partners Marquee */}
      <PartnersMarquee />

      {/* 3. About */}
      <AboutSection config={siteConfig} aboutText={aboutText} />

      {/* 4. Products */}
      <ProductsSection />

      {/* 5. Software */}
      <SoftwareSection config={siteConfig} />

      {/* 6. Stats Counter */}
      <StatsCounter stats={statsData} />

      {/* 7. Mobile App */}
      <MobileAppSection config={siteConfig} />

      {/* 8. Newsletter */}
      <NewsletterSection showToast={showToast} />
    </div>
  )
}
