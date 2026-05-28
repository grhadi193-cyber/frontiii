import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProfile, updateProfileApi, forgotPassword, resetPassword } from '../api/django.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'afi_token'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  // در mount، اگر token موجود بود پروفایل بگیر
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    getProfile(token)
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function login(newToken, userData) {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    // سبد خرید عمداً پاک نمی‌شود
  }

  // بروزرسانی پروفایل
  const updateProfile = useCallback(async (data) => {
    if (!token) throw new Error('لاگین نشده‌اید')
    const updated = await updateProfileApi(token, data)
    setUser(updated)
    return updated
  }, [token])

  // آیا کاربر ادمین/استاف است
  const isAdmin = !!(user?.is_staff || user?.is_admin)

  // آیا پروفایل کاربر تکمیل شده است
  // بک‌اند فیلد full_name دارد نه first_name/last_name
  const isProfileComplete = !!(
    user?.full_name?.trim() && user?.national_id
  )

  const value = {
    user,
    token,
    loading,
    isLoggedIn: !!token && !!user,
    isAdmin,
    isProfileComplete,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth باید داخل AuthProvider استفاده شود')
  return ctx
}

export default AuthContext
