import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getSiteConfig } from '../api/pocketbase.js'
import { pbImageUrl } from '../api/pocketbase.js'

const NAV_LINKS = [
  { to: '/',         label: 'خانه' },
  { to: '/products', label: 'محصولات' },
  { to: '/software', label: 'نرم‌افزار' },
  { to: '/blog',     label: 'وبلاگ' },
  { to: '/about',    label: 'درباره ما' },
  { to: '/contact',   label: 'تماس' },
]

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth()
  const { totalCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)

  useEffect(() => {
    getSiteConfig().then(cfg => {
      if (cfg?.logo) setLogoUrl(pbImageUrl(cfg, cfg.logo))
    }).catch(() => {})

    // گوش دادن به تغییر لوگو از ادمین
    const handler = (e) => setLogoUrl(e.detail?.url || null)
    window.addEventListener('site-logo-updated', handler)
    return () => window.removeEventListener('site-logo-updated', handler)
  }, [])
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const navBgClass = scrolled
    ? 'bg-white/95 backdrop-blur-xl border-b border-[var(--color-border)] shadow-[0_2px_20px_rgba(0,0,0,0.05)]'
    : 'bg-white/95 backdrop-blur-sm border-b border-transparent'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo (left in RTL) */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="لوگو" className="h-10 w-auto max-w-[160px] object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shadow-sm shadow-[rgba(79,70,229,0.3)]">
                  <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
                    <circle cx="18" cy="18" r="8" fill="white" opacity="0.9" />
                    <circle cx="18" cy="18" r="3.5" fill="var(--color-accent)" />
                    <path d="M18 4 L18 11 M18 25 L18 32 M4 18 L11 18 M25 18 L32 18"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-base font-black text-[var(--color-primary)]">ATI FARZAM</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-wide">IRANIAN</span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop nav links (center) */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/8'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Panel login (ghost) */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl border-[1.5px] border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all duration-200"
            >
              ورود به پنل
            </a>

            {/* Consultation CTA */}
            <Link
              to="/contact"
              className="hidden md:inline-flex px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-bold shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] hover:-translate-y-px transition-all duration-200"
            >
              مشاوره رایگان
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-gray-50 transition-colors"
              aria-label={`سبد خرید (${totalCount} مورد)`}
            >
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalCount > 99 ? '99+' : totalCount}
                </span>
              )}
            </Link>

            {/* Auth: user menu or login */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="hidden sm:block text-sm text-[var(--color-text-primary)] max-w-[80px] truncate">
                    {user?.first_name || 'پروفایل'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-[var(--color-border)] rounded-xl shadow-xl py-1 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}>پروفایل من</Link>
                    <Link to="/profile/orders" className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}>سفارش‌های من</Link>
                    {user?.is_admin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                        onClick={() => setUserMenuOpen(false)}>پنل ادمین</Link>
                    )}
                    <hr className="my-1 border-[var(--color-border)]" />
                    <button onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
              >
                ورود
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="منوی موبایل"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-4 bg-white/98 backdrop-blur-xl">
            <ul className="flex flex-col gap-1 px-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/8'
                          : 'text-[var(--color-text-secondary)] hover:bg-gray-50'
                      }`
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] px-4 flex flex-col gap-3">
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center px-5 py-3 rounded-xl bg-[var(--color-accent)] text-white font-bold hover:shadow-lg transition-shadow"
              >
                مشاوره رایگان
              </Link>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center px-5 py-3 rounded-xl border-[1.5px] border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                ورود به پنل
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
