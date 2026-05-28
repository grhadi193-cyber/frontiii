import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getPartners, pbImageUrl } from '../api/pocketbase.js'

const FALLBACK_PARTNERS = [
  { id: '1', name: 'شرکت الف' },
  { id: '2', name: 'شرکت ب' },
  { id: '3', name: 'شرکت ج' },
  { id: '4', name: 'شرکت د' },
  { id: '5', name: 'شرکت ه' },
  { id: '6', name: 'شرکت و' },
]

function PartnerLogo({ partner }) {
  const logoUrl = partner.logo ? pbImageUrl(partner, partner.logo) : null
  return (
    <div className="flex-shrink-0 mx-10 flex items-center justify-center h-20">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={partner.name}
          className="h-12 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          loading="lazy"
        />
      ) : (
        <div className="px-8 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-body)] text-[var(--color-text-secondary)] font-semibold text-sm whitespace-nowrap">
          {partner.name}
        </div>
      )}
    </div>
  )
}

export default function PartnersMarquee() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartners().then((data) => {
      setPartners(data.length > 0 ? data : FALLBACK_PARTNERS)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <section className="w-full py-16 bg-white border-y border-[var(--color-border)]">
        <div className="text-center mb-8">
          <div className="h-4 w-48 bg-[var(--color-border)] rounded mx-auto animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-8 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-32 bg-[var(--color-bg-body)] rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </section>
    )
  }

  if (partners.length === 0) return null

  // Duplicate for seamless loop
  const doubled = [...partners, ...partners]

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="w-full py-16 bg-white border-y border-[var(--color-border)] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-medium text-[var(--color-text-muted)] tracking-wider">
          مورد اعتماد کسب‌وکارهای برتر
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Track */}
        <div className="flex items-center animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((partner, idx) => (
            <PartnerLogo key={`${partner.id}-${idx}`} partner={partner} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
