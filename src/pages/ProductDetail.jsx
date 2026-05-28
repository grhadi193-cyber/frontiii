import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import ImageSlider from '../components/ImageSlider.jsx'
import QuantitySelector from '../components/QuantitySelector.jsx'
import ToastContainer, { useToast } from '../components/Toast.jsx'
import { ProductSEO } from '../components/seo/SEO.jsx'
import { useProduct } from '../hooks/useProducts.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

// ── Skeleton ──────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
      <div className="aspect-square rounded-2xl bg-gray-100" />
      <div className="space-y-4 pt-2">
        <div className="h-6 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-8 bg-gray-100 rounded-lg w-1/2 mt-4" />
        <div className="h-4 bg-gray-100 rounded-lg w-full" />
        <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
        <div className="h-12 bg-gray-100 rounded-xl mt-6" />
      </div>
    </div>
  )
}

// ── Price block ───────────────────────────────────────────────
function PriceBlock({ product }) {
  const price = product?.price ?? 0
  const hasDisc = product?.is_on_sale && product?.sale_price
  const effPrice = hasDisc ? product.sale_price : price

  function toFa(n) {
    return Number(n).toLocaleString('fa-IR')
  }

  const discPct = hasDisc ? Math.round((1 - product.sale_price / price) * 100) : 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasDisc && (
        <span className="text-gray-400 line-through text-base">{toFa(price)} تومان</span>
      )}
      <span className="text-2xl font-black text-primary">{toFa(effPrice)} تومان</span>
      {hasDisc && discPct > 0 && (
        <span className="px-2.5 py-1 bg-accent text-white text-xs font-bold rounded-lg">
          {String(discPct).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}٪ تخفیف
        </span>
      )}
    </div>
  )
}

// ── Stock badge ───────────────────────────────────────────────
function StockBadge({ product }) {
  const qty = product?.stock_quantity
  if (qty === undefined || qty === null) {
    return <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500" />موجود</span>
  }
  if (qty <= 0) {
    return <span className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium"><span className="w-2 h-2 rounded-full bg-red-400" />ناموجود</span>
  }
  if (qty <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-orange-500 font-medium">
        <span className="w-2 h-2 rounded-full bg-orange-400" />
        تنها {String(qty).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])} عدد باقی مانده
      </span>
    )
  }
  return <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500" />موجود در انبار</span>
}

// ── Features list ─────────────────────────────────────────────
function FeaturesList({ features }) {
  if (!features || features.length === 0) return null
  return (
    <div className="mt-8">
      <h3 className="font-bold text-gray-800 mb-4 text-base">ویژگی‌های محصول</h3>
      <ul className="space-y-2.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Gallery thumbnails ────────────────────────────────────────
function ImageGallery({ images, alt }) {
  if (!images || images.length === 0) return null

  const [selected, setSelected] = useState(0)
  const imageUrls = images.map((img) => (typeof img === 'string' ? img : img.url))

  return (
    <div>
      <ImageSlider images={imageUrls} alt={alt} />
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((img, i) => {
            const url = typeof img === 'string' ? img : img.url
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  i === selected ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={url} alt={`${alt} - ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Description block ─────────────────────────────────────────
function DescriptionBlock({ description }) {
  if (!description) return null
  return (
    <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">توضیحات محصول</h2>
      <div className="text-gray-600 text-sm leading-8 whitespace-pre-line">
        {description}
      </div>
    </div>
  )
}

// ── Main ProductDetail ────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isLoggedIn } = useAuth()
  const { toasts, showToast } = useToast()

  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  // Use React Query hook (fetches from Django + merges with PocketBase images)
  const {
    data: product,
    isLoading: loading,
    error,
  } = useProduct(id)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const inStock = !product || product.stock_quantity === undefined || product.stock_quantity > 0
  const images = product?.gallery || []

  function handleAddToCart() {
    if (!isLoggedIn) {
      navigate(`/login?redirect=/products/${id}`)
      return
    }
    if (!product) return
    setAdding(true)
    const cartItem = {
      product_id: product.id,
      name: product.name,
      price: product.is_on_sale && product.sale_price ? product.sale_price : product.price,
      imageUrl: product.primaryImage || null,
      quantity: qty,
    }
    addItem(cartItem)
    setTimeout(() => {
      setAdding(false)
      showToast(`«${product.name}» به سبد خرید اضافه شد`, 'success')
    }, 400)
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <DetailSkeleton />
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-bold text-gray-800 mb-2">محصول یافت نشد</h2>
          <p className="text-gray-400 text-sm mb-6">{error?.message || 'محصول مورد نظر وجود ندارد یا حذف شده است'}</p>
          <Link to="/products" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
            بازگشت به محصولات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ProductSEO product={product} url={window.location.href} />
      <ToastContainer toasts={toasts} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[
            { label: 'خانه', to: '/' },
            { label: 'محصولات', to: '/products' },
            { label: product.name },
          ]} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Main section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* تصاویر — from frontend PocketBase gallery */}
          <div>
            <ImageGallery images={images} alt={product.name} />
          </div>

          {/* اطلاعات — from Django backend */}
          <div className="flex flex-col">

            {/* دسته‌بندی */}
            {product.category_name && (
              <span className="text-xs text-primary font-medium bg-primary/8 px-3 py-1 rounded-full w-fit mb-3">
                {product.category_name}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 leading-snug">
              {product.name}
            </h1>

            {/* وضعیت موجودی */}
            <div className="mb-5">
              <StockBadge product={product} />
            </div>

            {/* قیمت */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <PriceBlock product={product} />
            </div>

            {/* توضیح کوتاه */}
            {product.short_description && (
              <p className="text-gray-500 text-sm leading-7 mb-6">
                {product.short_description}
              </p>
            )}

            {/* ویژگی‌ها — merged from PB + Django */}
            <FeaturesList features={product.features} />

            {/* انتخاب تعداد + افزودن به سبد */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                {inStock && (
                  <QuantitySelector
                    value={qty}
                    onChange={setQty}
                    max={product.stock_quantity || 99}
                  />
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || adding}
                  className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-base transition-all ${
                    inStock && !adding
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {adding ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                  {!inStock ? 'ناموجود' : adding ? 'در حال افزودن...' : 'افزودن به سبد خرید'}
                </button>
              </div>

              {/* راهنمای لاگین */}
              {!isLoggedIn && inStock && (
                <p className="text-xs text-gray-400 mt-3">
                  برای خرید باید{' '}
                  <Link to={`/login?redirect=/products/${id}`} className="text-primary font-medium hover:underline">
                    وارد حساب کاربری
                  </Link>
                  {' '}خود شوید
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── توضیحات کامل ── */}
        <DescriptionBlock description={product.description} />
      </div>
    </div>
  )
}
