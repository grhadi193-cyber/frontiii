import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getBlog, getBlogs, pbImageUrl } from '../api/pocketbase.js'
import Breadcrumb from '../components/Breadcrumb.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

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

function RelatedCard({ post }) {
  const imgUrl = post.cover ? pbImageUrl(post, post.cover) : null
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="flex gap-3 group hover:bg-gray-50 p-2 rounded-xl transition-colors"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {imgUrl ? (
          <img src={imgUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors">{post.title}</p>
        <time className="text-xs text-gray-400 mt-1 block">{formatDate(post.created)}</time>
      </div>
    </Link>
  )
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      setPost(null)
      try {
        const data = await getBlog(slug)
        if (cancelled) return
        if (!data) {
          navigate('/blog', { replace: true })
          return
        }
        setPost(data)
        // پست‌های مرتبط: ۳ پست جدید (به جز پست فعلی)
        const relData = await getBlogs(1, 6)
        if (!cancelled) {
          const filtered = (relData.items || []).filter((p) => p.slug !== slug).slice(0, 3)
          setRelated(filtered)
        }
      } catch (err) {
        if (!cancelled) setError('خطا در بارگذاری مطلب. لطفاً دوباره تلاش کنید.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner size="lg" text="در حال بارگذاری مطلب..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Link to="/blog" className="text-primary text-sm hover:underline">← بازگشت به بلاگ</Link>
      </div>
    )
  }

  if (!post) return null

  const coverUrl = post.cover ? pbImageUrl(post, post.cover) : null

  return (
    <main className="min-h-[60vh]">
      {/* کاور */}
      {coverUrl && (
        <div className="w-full max-h-[480px] overflow-hidden bg-gray-900">
          <img
            src={coverUrl}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
            style={{ maxHeight: 480 }}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={[
            { label: 'خانه', to: '/' },
            { label: 'بلاگ', to: '/blog' },
            { label: post.title },
          ]} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* مقاله */}
          <article>
            <header className="mb-8">
              <time className="text-sm text-gray-400 font-medium block mb-3">
                {formatDate(post.created)}
              </time>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-relaxed">
                {post.title}
              </h1>
              {post.summary && (
                <p className="mt-4 text-gray-500 text-base leading-relaxed border-r-4 border-primary pr-4 bg-primary/5 py-3 rounded-l-xl">
                  {post.summary}
                </p>
              )}
            </header>

            {/* محتوا */}
            {post.content ? (
              <div
                className="prose prose-base max-w-none text-gray-700 leading-loose
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-blockquote:border-r-4 prose-blockquote:border-primary prose-blockquote:pr-4 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-gray-400 text-sm">محتوایی برای این مطلب وجود ندارد.</p>
            )}
          </article>

          {/* سایدبار — پست‌های مرتبط */}
          {related.length > 0 && (
            <aside className="lg:border-r border-gray-100 lg:pr-8">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                مطالب مرتبط
              </h3>
              <div className="flex flex-col gap-3">
                {related.map((p) => <RelatedCard key={p.id} post={p} />)}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  to="/blog"
                  className="flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-2.5 transition-all"
                >
                  <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  همه مطالب
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  )
}
