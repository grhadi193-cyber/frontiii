import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { ProductSkeletonGrid } from '../components/ProductSkeleton.jsx'
import Pagination from '../components/Pagination.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import { PageSEO } from '../components/seo/SEO.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { getCategories } from '../api/django.js'
import { motion } from 'framer-motion'

const PAGE_SIZE = 12

// ── Category filter pills ────────────────────────────────────
function CategoryPills({ categories, active, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
          !active
            ? 'bg-[var(--color-primary)] text-white border-transparent shadow-md shadow-[var(--color-primary)]/25'
            : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
        }`}
      >
        همه
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
            active === String(cat.id)
              ? 'bg-[var(--color-primary)] text-white border-transparent shadow-md shadow-[var(--color-primary)]/25'
              : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

// ── Search input ─────────────────────────────────────────────
function SearchInput({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-64 flex-shrink-0">
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجوی محصول..."
        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all bg-white"
      />
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────
function EmptyState({ hasFilter, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-body)] flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-[var(--color-border)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
        {hasFilter ? 'محصولی با این فیلتر یافت نشد' : 'محصولی موجود نیست'}
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">
        {hasFilter ? 'فیلترهای دیگری امتحان کنید' : 'لطفاً بعداً مراجعه کنید'}
      </p>
      {hasFilter && (
        <button
          onClick={onClear}
          className="mt-4 px-5 py-2.5 border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl text-sm font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          حذف فیلترها
        </button>
      )}
    </motion.div>
  )
}

// ── Main Products Page ───────────────────────────────────────
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])

  const page = parseInt(searchParams.get('page') || '1', 10)
  const categoryId = searchParams.get('category') || null
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')

  // Fetch categories once
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : data?.results || []))
      .catch(() => {})
  }, [])

  // Debounce search
  const debounceRef = useRef(null)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(searchInput), 500)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  // Sync search to URL
  useEffect(() => {
    const params = {}
    if (page > 1) params.page = page
    if (categoryId) params.category = categoryId
    if (search) params.search = search
    setSearchParams(params, { replace: true })
  }, [page, categoryId, search]) // eslint-disable-line react-hooks/exhaustive-deps

  // Use React Query hook for products
  const {
    data: productsData,
    isLoading: loading,
    error,
    isFetching,
  } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    categoryId,
    search,
  })

  const products = productsData?.items || []
  const totalCount = productsData?.count || 0
  const totalPages = productsData?.totalPages || 1

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  function handleCategoryChange(id) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) next.set('category', id); else next.delete('category')
      next.delete('page')
      return next
    })
  }

  function handlePageChange(p) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (p > 1) next.set('page', p); else next.delete('page')
      return next
    })
  }

  function handleClearFilters() {
    setSearchInput('')
    setSearchParams({})
  }

  const hasFilter = !!(categoryId || search)

  // SEO title
  const seoTitle = categoryId
    ? `${categories.find(c => String(c.id) === categoryId)?.name || 'محصولات'} — خرید ردیاب GPS`
    : search
      ? `نتایج جستجو: ${search}`
      : 'محصولات سخت‌افزاری — ردیاب‌های GPS'

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)] pt-[72px]">
      <PageSEO
        title={seoTitle}
        description="خرید ردیاب GPS با کیفیت برتر — ردیاب‌های آنلاین، آفلاین و ماهواره‌ای با گارانتی ۱۲ ماهه. ارسال به سراسر کشور."
      />

      {/* Page header */}
      <div className="bg-gradient-to-bl from-[var(--color-bg-dark)] via-[#1E1B4B] to-[#312E81] relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <Breadcrumb items={[
            { label: 'خانه', to: '/' },
            { label: 'محصولات' },
          ]} />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-black text-white mt-4"
          >
            {categoryId
              ? categories.find(c => String(c.id) === categoryId)?.name || 'محصولات'
              : search
                ? `نتایج جستجو: ${search}`
                : 'محصولات سخت‌افزاری'}
          </motion.h1>

          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-white/50 mt-3"
            >
              {String(totalCount).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])} محصول
            </motion.p>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <CategoryPills
              categories={categories}
              active={categoryId}
              onSelect={handleCategoryChange}
            />
          </div>
          <div className="w-full sm:w-64 flex-shrink-0">
            <SearchInput value={searchInput} onChange={setSearchInput} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sync indicator */}
        {isFetching && !loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4">
            <span className="w-3 h-3 border border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            در حال بروزرسانی...
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-8">
            <p className="text-red-600 font-medium">خطا در بارگذاری محصولات</p>
            <p className="text-red-400 text-sm mt-1">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <ProductSkeletonGrid count={PAGE_SIZE} />
        ) : !error && (
          <>
            {products.length === 0 ? (
              <EmptyState hasFilter={hasFilter} onClear={handleClearFilters} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <ProductCard product={p} imageUrl={p.primaryImage} variant="grid" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
