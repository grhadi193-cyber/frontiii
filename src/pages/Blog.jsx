import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBlogs, pbImageUrl } from '../api/pocketbase.js'
import Pagination from '../components/Pagination.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import SectionTitle from '../components/SectionTitle.jsx'

const PER_PAGE = 9

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function BlogCard({ post }) {
  const imgUrl = post.cover
    ? pbImageUrl(post, post.cover)
    : null

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col">
      {/* تصویر */}
      <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/5 to-primary/15 flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* محتوا */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* تاریخ */}
        <time className="text-xs text-gray-400 font-medium">
          {formatDate(post.created)}
        </time>

        {/* عنوان */}
        <h2 className="text-gray-800 font-bold text-base leading-relaxed line-clamp-2">
          {post.title}
        </h2>

        {/* خلاصه */}
        {post.summary && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
            {post.summary}
          </p>
        )}

        {/* دکمه */}
        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-2.5 transition-all mt-auto pt-2"
        >
          ادامه مطلب
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  )
}

function BlogSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="aspect-[16/9] bg-gray-100" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
        <div className="h-4 w-24 bg-gray-100 rounded mt-2" />
      </div>
    </div>
  )
}

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getBlogs(page, PER_PAGE)
        if (cancelled) return
        setPosts(data.items || [])
        setTotalPages(data.totalPages || 1)
      } catch (err) {
        if (!cancelled) setError('خطا در بارگذاری مطالب. لطفاً دوباره تلاش کنید.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page])

  // scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  return (
    <main className="min-h-[60vh]">
      {/* هدر */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-14 text-center text-white">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-black mb-3">بلاگ ATI Farzam</h1>
          <p className="text-white/75 text-base">آخرین اخبار، مقالات آموزشی و راهنماهای فناوری ردیابی</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: PER_PAGE }).map((_, i) => <BlogSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => setPage(1)}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">هنوز مطلبی منتشر نشده است.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => <BlogCard key={post.id} post={post} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </main>
  )
}
