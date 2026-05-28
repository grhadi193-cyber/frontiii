import React, { useEffect, useState, useRef } from 'react'
import { pb, pbImageUrl } from '../../api/pocketbase.js'

function Section({ title, children, onSave, saving, saveLabel }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">{title}</h2>
        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'در حال ذخیره...' : (saveLabel || 'ذخیره')}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ── ColorPreview ──────────────────────────────────────────────
function ColorPreview({ primary, accent }) {
  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-gray-800">
      <div className="h-2" style={{ background: `linear-gradient(to left, ${accent}, ${primary})` }} />
      <div className="p-3 bg-gray-950 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: primary }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <circle cx="12" cy="12" r="5" fill="white" opacity="0.9" />
            <path d="M12 2L12 7M12 17L12 22M2 12L7 12M17 12L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ background: primary }}>دکمه اصلی</span>
          <span className="text-xs px-3 py-1 rounded-full font-medium text-white" style={{ background: accent }}>دکمه تأکید</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminSiteConfig() {
  const [record, setRecord]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // رنگ‌ها
  const [primaryColor, setPrimaryColor] = useState('#4F46E5')
  const [accentColor, setAccentColor]   = useState('#F97316')
  const [savingColors, setSavingColors] = useState(false)

  // لوگو
  const [logoFile, setLogoFile]       = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [currentLogo, setCurrentLogo] = useState(null)
  const [savingLogo, setSavingLogo]   = useState(false)
  const logoInputRef = useRef(null)

  // آمار
  const [stats, setStats]         = useState({ users: '', uptime: '', customers: '', years: '' })
  const [savingStats, setSavingStats] = useState(false)

  // لینک‌های نرم‌افزار
  const [softwareLinks, setSoftwareLinks] = useState({ portal: '', google_play: '', app_store: '' })
  const [savingLinks, setSavingLinks]     = useState(false)

  // تنظیمات درباره نرم‌افزار
  const [softwareInfo, setSoftwareInfo]     = useState({ description: '', features: '' })
  const [savingSoftware, setSavingSoftware] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const records = await pb.collection('site_config').getFullList({ limit: 1 })
      const r = records[0] || null
      setRecord(r)
      if (r) {
        setPrimaryColor(r.primary_color || '#4F46E5')
        setAccentColor(r.accent_color   || '#F97316')
        setStats({
          users:     r.stat_users     || '',
          uptime:    r.stat_uptime    || '',
          customers: r.stat_customers || '',
          years:     r.stat_years     || '',
        })
        setSoftwareLinks({
          portal:      r.link_portal      || '',
          google_play: r.link_google_play || '',
          app_store:   r.link_app_store   || '',
        })
        setSoftwareInfo({
          description: r.software_description || '',
          features:    Array.isArray(r.software_features)
            ? r.software_features.join('\n')
            : (r.software_features || ''),
        })
        // لوگو
        if (r.logo) {
          setCurrentLogo(pbImageUrl(r, r.logo))
        }
      }
    } catch (e) { setError('خطا در بارگذاری تنظیمات') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function flash(msg) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function upsert(data) {
    if (record?.id) {
      const r = await pb.collection('site_config').update(record.id, data)
      setRecord(r)
      return r
    } else {
      const r = await pb.collection('site_config').create(data)
      setRecord(r)
      return r
    }
  }

  // ── ذخیره رنگ‌ها ──────────────────────────────────────────
  async function saveColors() {
    setSavingColors(true)
    try {
      await upsert({ primary_color: primaryColor, accent_color: accentColor })
      // اعمال فوری
      const root = document.documentElement
      root.style.setProperty('--color-primary', primaryColor)
      root.style.setProperty('--color-accent',  accentColor)
      flash('رنگ‌بندی ذخیره شد ✓')
    } catch (e) { setError(e.message) }
    setSavingColors(false)
  }

  // ── ذخیره لوگو ────────────────────────────────────────────
  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function saveLogo() {
    if (!logoFile) return
    setSavingLogo(true)
    try {
      const fd = new FormData()
      fd.append('logo', logoFile)
      let r
      if (record?.id) {
        r = await pb.collection('site_config').update(record.id, fd)
      } else {
        r = await pb.collection('site_config').create(fd)
      }
      setRecord(r)
      if (r.logo) {
        const url = pbImageUrl(r, r.logo)
        setCurrentLogo(url)
        // اعمال فوری لوگو در navbar
        window.__siteLogoUrl = url
        window.dispatchEvent(new CustomEvent('site-logo-updated', { detail: { url } }))
      }
      setLogoFile(null)
      setLogoPreview(null)
      flash('لوگو آپدیت شد ✓')
    } catch (e) { setError(e.message) }
    setSavingLogo(false)
  }

  // ── ذخیره آمار ────────────────────────────────────────────
  async function saveStats() {
    setSavingStats(true)
    try {
      await upsert({
        stat_users:     stats.users,
        stat_uptime:    stats.uptime,
        stat_customers: stats.customers,
        stat_years:     stats.years,
      })
      flash('آمار ذخیره شد ✓')
    } catch (e) { setError(e.message) }
    setSavingStats(false)
  }

  // ── ذخیره لینک‌ها ──────────────────────────────────────────
  async function saveLinks() {
    setSavingLinks(true)
    try {
      await upsert({
        link_portal:      softwareLinks.portal,
        link_google_play: softwareLinks.google_play,
        link_app_store:   softwareLinks.app_store,
      })
      flash('لینک‌ها ذخیره شد ✓')
    } catch (e) { setError(e.message) }
    setSavingLinks(false)
  }

  // ── ذخیره نرم‌افزار ────────────────────────────────────────
  async function saveSoftware() {
    setSavingSoftware(true)
    try {
      const featuresArr = softwareInfo.features
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
      await upsert({
        software_description: softwareInfo.description,
        software_features:    featuresArr,
      })
      flash('اطلاعات نرم‌افزار ذخیره شد ✓')
    } catch (e) { setError(e.message) }
    setSavingSoftware(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-6">تنظیمات سایت</h1>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* ── لوگو سایت ── */}
      <Section title="لوگو سایت" onSave={logoFile ? saveLogo : null} saving={savingLogo} saveLabel="آپلود لوگو">
        <div className="flex items-start gap-5">
          {/* پیش‌نمایش */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden">
              {(logoPreview || currentLogo) ? (
                <img src={logoPreview || currentLogo} alt="لوگو" className="w-full h-full object-contain p-2" />
              ) : (
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            {logoPreview && (
              <button
                onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                className="mt-2 w-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                لغو
              </button>
            )}
          </div>

          {/* آپلود */}
          <div className="flex-1">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl text-sm text-gray-400 hover:text-indigo-400 transition-all"
            >
              + انتخاب تصویر لوگو
            </button>
            <p className="text-xs text-gray-600 mt-2">فرمت‌های PNG، SVG، JPG — حداکثر ۲MB</p>
            <p className="text-xs text-gray-600 mt-1">لوگو در نوار ناوبری و فوتر سایت نمایش داده می‌شود.</p>
            {logoFile && (
              <p className="text-xs text-indigo-400 mt-2 font-medium">
                ✓ {logoFile.name} انتخاب شد — دکمه «آپلود لوگو» را بزنید
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ── رنگ‌بندی ── */}
      <Section title="رنگ‌بندی برند" onSave={saveColors} saving={savingColors}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'رنگ اصلی (Primary)', value: primaryColor, onChange: setPrimaryColor },
            { label: 'رنگ تأکید (Accent)',  value: accentColor,  onChange: setAccentColor  },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm text-gray-400 mb-2">{f.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          ))}
        </div>
        <ColorPreview primary={primaryColor} accent={accentColor} />
        <p className="mt-3 text-xs text-gray-600">تغییر رنگ فوراً در مرورگر اعمال می‌شود.</p>
      </Section>

      {/* ── آمار شرکت ── */}
      <Section title="آمار شرکت" onSave={saveStats} saving={savingStats}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'users',     label: 'کاربر فعال'  },
            { key: 'uptime',    label: 'آپتایم (%)'  },
            { key: 'customers', label: 'مشتری'       },
            { key: 'years',     label: 'سال فعالیت'  },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm text-gray-400 mb-1.5">{f.label}</label>
              <input
                type="text"
                value={stats[f.key]}
                onChange={e => setStats(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── لینک‌های نرم‌افزار ── */}
      <Section title="لینک‌های نرم‌افزار" onSave={saveLinks} saving={savingLinks}>
        <div className="space-y-3">
          {[
            { key: 'portal',      label: 'ورود به سامانه' },
            { key: 'google_play', label: 'Google Play'    },
            { key: 'app_store',   label: 'App Store'      },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm text-gray-400 mb-1.5">{f.label}</label>
              <input
                type="url"
                value={softwareLinks[f.key]}
                onChange={e => setSoftwareLinks(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder="https://"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                dir="ltr"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── توضیحات نرم‌افزار ── */}
      <Section title="توضیحات نرم‌افزار" onSave={saveSoftware} saving={savingSoftware}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">متن توضیحات</label>
            <textarea
              value={softwareInfo.description}
              onChange={e => setSoftwareInfo(p => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">ویژگی‌ها (هر خط یک ویژگی)</label>
            <textarea
              value={softwareInfo.features}
              onChange={e => setSoftwareInfo(p => ({ ...p, features: e.target.value }))}
              rows={6}
              placeholder={'ردیابی آنلاین\nگزارش‌گیری پیشرفته\nهشدار آنی'}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </Section>
    </div>
  )
}
