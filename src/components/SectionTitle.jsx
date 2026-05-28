import React from 'react'
import { motion } from 'framer-motion'

export default function SectionTitle({
  title,
  subtitle,
  center = true,
  light = false,
  badge,
  badgeColor,
  className = '',
}) {
  const titleColor    = light ? 'text-white' : 'text-[var(--color-text-primary)]'
  const subtitleColor = light ? 'text-white/70' : 'text-[var(--color-text-secondary)]'
  const alignClass    = center ? 'text-center' : 'text-right'
  const lineAlign     = center ? 'mx-auto' : 'mr-0 ml-auto'
  const badgeBg       = badgeColor
    ? `bg-[${badgeColor}]/15 text-[${badgeColor}]`
    : light
      ? 'bg-white/15 text-white'
      : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`mb-12 ${alignClass} ${className}`}
    >
      {badge && (
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border border-current/20 ${badgeBg}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
          {badge}
        </motion.span>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.15 }}
        className={`text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight ${titleColor}`}
      >
        {title}
      </motion.h2>

      {/* Decorative gradient underline */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className={`mt-4 h-1 rounded-full origin-right ${lineAlign}`}
        style={{
          width: '64px',
          background: light
            ? 'linear-gradient(to left, rgba(255,255,255,0.8), rgba(255,255,255,0.3))'
            : 'linear-gradient(to left, var(--color-primary), var(--color-accent))'
        }}
      />

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className={`text-base sm:text-lg mt-5 max-w-2xl leading-8 ${subtitleColor} ${center ? 'mx-auto' : ''}`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
