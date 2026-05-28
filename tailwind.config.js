/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #4F46E5)',
          dark:    'var(--color-primary-dark, #3730A3)',
          light:   'var(--color-primary-light, #818CF8)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #F97316)',
          dark:    'var(--color-accent-dark, #EA580C)',
          light:   'var(--color-accent-light, #FB923C)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #06B6D4)',
        },
        body:      'var(--color-bg-body, #F8FAFC)',
        dark:      'var(--color-bg-dark, #0F0A1E)',
        'text-primary':   'var(--color-text-primary, #1E1B4B)',
        'text-secondary': 'var(--color-text-secondary, #64748B)',
        'text-muted':     'var(--color-text-muted, #94A3B8)',
        'border-custom':  'var(--color-border, #E2E8F0)',
        success: 'var(--color-success, #22C55E)',
        error:   'var(--color-error, #EF4444)',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee-scroll 30s linear infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'float-pin': 'float-pin 3s ease-in-out infinite',
        'float-card': 'float-card 4s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'orbit': 'orbit 8s linear infinite',
        'text-shimmer': 'text-shimmer 3s linear infinite',
        'counter-up': 'counter-up 0.6s ease-out forwards',
        'dash-flow': 'dash-flow 3s linear infinite',
      },
      keyframes: {
        'marquee-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        'float-pin': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'float-card': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,70,229,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(79,70,229,0.6), 0 0 80px rgba(79,70,229,0.2)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'orbit': {
          from: { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'counter-up': {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.8)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'dash-flow': {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
