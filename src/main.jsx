import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { getSiteConfig } from './api/pocketbase.js'
import './index.css'

// ── React Query client ───────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
})

// ── Apply theme from PocketBase site_config ──────────────────
async function applySiteTheme() {
  try {
    const config = await getSiteConfig()
    if (!config) return

    const root = document.documentElement

    if (config.primary_color) {
      root.style.setProperty('--color-primary', config.primary_color)
      root.style.setProperty('--color-primary-dark', adjustBrightness(config.primary_color, -30))
      root.style.setProperty('--color-primary-light', adjustBrightness(config.primary_color, 30))
    }
    if (config.accent_color) {
      root.style.setProperty('--color-accent', config.accent_color)
      root.style.setProperty('--color-accent-dark', adjustBrightness(config.accent_color, -20))
      root.style.setProperty('--color-accent-light', adjustBrightness(config.accent_color, 20))
    }
    if (config.secondary_color) {
      root.style.setProperty('--color-secondary', config.secondary_color)
    }

    // اعمال لوگو اگه وجود داشت
    if (config.logo) {
      const { pbImageUrl } = await import('./api/pocketbase.js')
      window.__siteLogoUrl = pbImageUrl(config, config.logo)
    }
  } catch (err) {
    console.warn('[Theme] Failed to load site theme:', err.message)
  }
}

// Simple hex brightness adjuster
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent)))
  const b = Math.min(255, Math.max(0, (num & 0x00FF) + Math.round(2.55 * percent)))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

// Run theme injection immediately
applySiteTheme()

// ── Render ───────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
