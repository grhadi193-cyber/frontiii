import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* هدر */}
          <div className="bg-gradient-to-l from-accent to-orange-400 px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-white text-xl font-bold">ثبت‌نام</h1>
            <p className="text-white/70 text-sm mt-1">ATI Farzam Iranian GPS</p>
          </div>

          <div className="p-6 text-center">
            {/* توضیح */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-right">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800 leading-relaxed text-right">
                  <p className="font-semibold mb-1">ثبت‌نام از طریق کد OTP</p>
                  <p>
                    در این سیستم، برای ثبت‌نام کافی است با شماره موبایل خود وارد شوید.
                    اگر حساب کاربری ندارید، با اولین ورود موفق از طریق کد OTP، حساب شما
                    به‌طور خودکار ساخته می‌شود.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="block w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition text-center"
            >
              ورود / ثبت‌نام با OTP
            </Link>

            <p className="text-xs text-gray-400 mt-4">
              با ورود، با{' '}
              <span className="text-primary">قوانین و مقررات</span>
              {' '}ATI Farzam موافقت می‌کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
