import React, { useEffect, useState } from 'react'
import { getPage, getSiteConfig, pbImageUrl } from '../api/pocketbase.js'
import StatsCounter from '../components/StatsCounter.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const DEFAULT_STATS = [
  { value: 5000, label: 'مشتری فعال',   prefix: '+' },
  { value: 99,   label: 'آپتایم سرویس', suffix: '%' },
  { value: 15,   label: 'سال تجربه',    prefix: '+' },
  { value: 200,  label: 'شهر پوشش',     prefix: '+' },
]

const DEFAULT_TEAM = [
  { name: 'علیرضا فرزام',    role: 'مدیرعامل',      initials: 'ع.ف' },
  { name: 'سارا محمدی',      role: 'مدیر فناوری',   initials: 'س.م' },
  { name: 'کاوه رضایی',     role: 'مدیر محصول',    initials: 'ک.ر' },
  { name: 'نرگس قاسمی',     role: 'پشتیبانی فنی',  initials: 'ن.ق' },
]

function TeamCard({ member, imgUrl }) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-light flex items-center justify-center flex-shrink-0 shadow-md">
        {imgUrl ? (
          <img src={imgUrl} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-white text-xl font-bold">{member.initials || member.name?.charAt(0)}</span>
        )}
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-800">{member.name}</p>
        <p className="text-sm text-primary font-medium mt-0.5">{member.role}</p>
        {member.bio && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{member.bio}</p>}
      </div>
    </div>
  )
}

export default function About() {
  const [page, setPage] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPage('about'), getSiteConfig()])
      .then(([pageData, cfgData]) => {
        setPage(pageData)
        setConfig(cfgData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = config?.stats || DEFAULT_STATS
  const team = config?.team || page?.team || DEFAULT_TEAM
  const title = page?.title || 'درباره ATI Farzam Iranian'
  const content = page?.content || null
  const intro = page?.intro || config?.about_intro || 'شرکت ATI Farzam Iranian با بیش از یک دهه سابقه در صنعت ردیابی GPS، خدمات پیشرفته مدیریت ناوگان و سیستم‌های امنیتی را به صدها کسب‌وکار در سراسر ایران ارائه می‌دهد.'

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="در حال بارگذاری..." />
      </div>
    )
  }

  return (
    <main className="min-h-[60vh]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light py-20 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-black mb-4">{title}</h1>
          <p className="text-white/80 text-base leading-relaxed">{intro}</p>
        </div>
      </section>

      {/* آمار */}
      <StatsCounter stats={stats} />

      {/* محتوای صفحه */}
      {content && (
        <section className="py-14 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div
              className="prose prose-base max-w-none text-gray-700 leading-loose
                prose-headings:font-bold prose-headings:text-gray-900
                prose-a:text-primary prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </section>
      )}

      {/* مزایا */}
      {!content && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-gray-900 text-center mb-10">چرا ATI Farzam?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '🏆', title: 'تجربه اثبات‌شده', desc: 'بیش از ۱۵ سال حضور فعال در بازار ردیابی ایران.' },
                { icon: '🛡️', title: 'پشتیبانی ۲۴/۷',  desc: 'تیم متخصص ما همیشه آماده پاسخگویی است.' },
                { icon: '🔧', title: 'سخت‌افزار باکیفیت', desc: 'محصولات استاندارد با گارانتی معتبر.' },
                { icon: '📡', title: 'پوشش سراسری', desc: 'خدمات در بیش از ۲۰۰ شهر ایران.' },
                { icon: '💡', title: 'فناوری روز', desc: 'به‌روزرسانی مستمر نرم‌افزار و سخت‌افزار.' },
                { icon: '🤝', title: 'اعتماد مشتریان', desc: 'بیش از ۵۰۰۰ مشتری راضی در سراسر کشور.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-md hover:border hover:border-gray-100 transition-all duration-300">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* تیم */}
      {team && team.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-gray-900 text-center mb-10">تیم ما</h2>
            <div className={`grid gap-6 ${team.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto' : team.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {team.map((member, idx) => {
                const imgUrl = member.avatar && config
                  ? pbImageUrl(config, member.avatar)
                  : null
                return <TeamCard key={idx} member={member} imgUrl={imgUrl} />
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
