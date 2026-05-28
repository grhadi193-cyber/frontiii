import React, { useRef, useState, useEffect } from 'react'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'

function toFa(n) {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
}

function useScrollTrigger() {
  const [triggered, setTriggered] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, triggered }
}

// آیکون‌های مربوط به هر آمار
const STAT_ICONS = [
  // آپتایم
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>,
  // کاربران
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>,
  // مشتری
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  // سال فعالیت
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  // پشتیبانی
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
    <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>,
]

function StatItem({ value, label, prefix = '', suffix = '', decimals = 0, isStatic = false, delay = 0, index = 0 }) {
  const { ref, triggered } = useScrollTrigger()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative group"
    >
      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center
                      hover:bg-white/15 transition-all duration-300 hover:-translate-y-1
                      hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Glow behind card on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4 text-white
                        group-hover:bg-white/25 transition-colors duration-300">
          {STAT_ICONS[index % STAT_ICONS.length]}
        </div>

        {/* Number */}
        <div className="text-3xl sm:text-4xl font-black text-white mb-1 flex items-center justify-center gap-1">
          {prefix && <span className="text-2xl sm:text-3xl opacity-80">{prefix}</span>}
          {isStatic ? (
            <span>{toFa(value)}</span>
          ) : (
            <CountUp
              start={0}
              duration={2.5}
              decimals={decimals}
              separator=","
              formattingFn={(n) => toFa(n)}
              startOnMount={triggered}
              end={value}
            />
          )}
          {suffix && <span className="text-2xl sm:text-3xl opacity-80">{suffix}</span>}
        </div>

        {/* Label */}
        <div className="text-sm text-white/70 font-medium">{label}</div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  )
}

export default function StatsCounter({ stats }) {
  const defaultStats = [
    { value: 99.9, label: 'آپتایم سرویس', suffix: '%', decimals: 1 },
    { value: 5000, label: 'کاربر فعال', prefix: '+' },
    { value: 2000, label: 'مشتری راضی', prefix: '+' },
    { value: 15,   label: 'سال فعالیت', prefix: '+' },
    { value: 24,   label: 'پشتیبانی فنی', suffix: '/۷', isStatic: true },
  ]

  const items = stats || defaultStats

  return (
    <section className="w-full py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[#6366F1]" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: '128px 128px' }} />

      {/* Decorative orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-accent)]/5 pointer-events-none blur-3xl" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {items.map((stat, i) => (
            <StatItem key={i} {...stat} delay={i * 0.1} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
