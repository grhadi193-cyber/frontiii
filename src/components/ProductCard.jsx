import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { motion } from 'framer-motion'

export default function ProductCard({ product, imageUrl, variant = 'grid' }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const price = product?.price ?? 0
  const hasDisc = product?.is_on_sale && product?.sale_price
  const effPrice = hasDisc ? product.sale_price : price
  const inStock = product?.stock_quantity === undefined || product?.stock_quantity > 0

  const discPct = hasDisc
    ? Math.round((1 - product.sale_price / price) * 100)
    : 0

  function toFa(n) {
    return Number(n).toLocaleString('fa-IR')
  }

  function handleAddToCart(e) {
    e.preventDefault()
    addItem({
      product_id: product.id,
      name: product.name,
      price: effPrice,
      imageUrl: imageUrl || null,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const features = product?.features || []

  // ── Featured Variant ──────────────────────────────────────
  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="group bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col"
      >
        {/* Image area */}
        <Link to={`/products/${product.id}`} className="relative bg-gradient-to-br from-[var(--color-bg-body)] to-[#EEF2FF] overflow-hidden" style={{ aspectRatio: '16/10' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 80 80" className="w-24 h-24 opacity-25" fill="none">
                <circle cx="40" cy="40" r="18" fill="var(--color-primary)" />
                <circle cx="40" cy="40" r="7" fill="white" />
                <circle cx="40" cy="40" r="3" fill="var(--color-accent)" />
                <path d="M40 10 L40 24 M40 56 L40 70 M10 40 L24 40 M56 40 L70 40"
                  stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* Discount badge */}
          {hasDisc && discPct > 0 && (
            <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-1">
              <span className="px-3 py-1 bg-[var(--color-accent)] text-white text-xs font-black rounded-full shadow-lg shadow-[rgba(249,115,22,0.4)]">
                {toFa(discPct)}٪
              </span>
              <span className="text-[10px] font-bold text-[var(--color-accent)] bg-white/90 backdrop-blur px-2 py-0.5 rounded-full">
                تخفیف ویژه
              </span>
            </div>
          )}

          {/* New badge */}
          {product.badge_text && (
            <span
              className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: product.badge_color || 'var(--color-primary)' }}
            >
              {product.badge_text}
            </span>
          )}

          {/* Out of stock */}
          {!inStock && (
            <span className="absolute top-4 right-4 z-10 px-3 py-1 bg-[var(--color-text-secondary)] text-white text-xs font-bold rounded-full">
              ناموجود
            </span>
          )}
        </Link>

        {/* Content area */}
        <div className="p-6 flex flex-col flex-1">
          <Link to={`/products/${product.id}`}>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2 leading-snug hover:text-[var(--color-primary)] transition-colors duration-200">
              {product.name}
            </h3>
          </Link>

          {/* Feature list */}
          {features.length > 0 && (
            <div className="space-y-2 mb-4 flex-1">
              {features.slice(0, 5).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <svg className="w-3.5 h-3.5 text-[var(--color-success)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--color-border)]">
            <div className="flex flex-col items-start gap-1">
              {hasDisc ? (
                <>
                  <span className="text-sm text-[var(--color-text-muted)] line-through">{toFa(price)} تومان</span>
                  <span className="text-2xl font-black text-[var(--color-primary)]">{toFa(effPrice)} تومان</span>
                </>
              ) : (
                <span className="text-2xl font-black text-[var(--color-primary)]">{toFa(effPrice)} تومان</span>
              )}
            </div>
            <Link
              to={`/products/${product.id}`}
              className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
            >
              مشاهده محصول
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Grid Variant ──────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative bg-gradient-to-br from-[var(--color-bg-body)] to-[#EEF2FF] aspect-[4/3] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-20 h-20 opacity-25" fill="none">
              <circle cx="40" cy="40" r="18" fill="var(--color-primary)" />
              <circle cx="40" cy="40" r="7" fill="white" />
              <circle cx="40" cy="40" r="3" fill="var(--color-accent)" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {!inStock && (
            <span className="px-2.5 py-1 bg-[var(--color-text-secondary)] text-white text-xs font-bold rounded-lg">ناموجود</span>
          )}
          {hasDisc && inStock && discPct > 0 && (
            <span className="px-2.5 py-1 bg-[var(--color-accent)] text-white text-xs font-bold rounded-lg">
              {toFa(discPct)}٪ تخفیف
            </span>
          )}
        </div>

        {product.badge_text && (
          <span
            className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: product.badge_color || 'var(--color-primary)' }}
          >
            {product.badge_text}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1 line-clamp-2 hover:text-[var(--color-primary)] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.category_name && (
          <span className="inline-flex px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium rounded-full mb-2 w-fit">
            {product.category_name}
          </span>
        )}

        {features.length > 0 && (
          <div className="space-y-1.5 mb-3 flex-1">
            {features.slice(0, 2).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <svg className="w-3 h-3 text-[var(--color-success)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDisc ? (
              <>
                <span className="text-xs text-[var(--color-text-muted)] line-through">{toFa(price)} تومان</span>
                <span className="text-lg font-black text-[var(--color-primary)]">{toFa(effPrice)} تومان</span>
              </>
            ) : (
              <span className="text-lg font-black text-[var(--color-primary)]">{toFa(effPrice)} تومان</span>
            )}
          </div>

          {inStock ? (
            <button
              onClick={handleAddToCart}
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                added
                  ? 'bg-[var(--color-success)] text-white'
                  : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
              }`}
              aria-label="افزودن به سبد خرید"
            >
              {added ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </button>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">ناموجود</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
