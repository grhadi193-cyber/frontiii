import React, { useRef, useEffect } from 'react'

/**
 * OtpInput — ۶ باکس جداگانه
 * Props: value, onChange, disabled?, error?
 */
export default function OtpInput({ value = '', onChange, disabled = false, error = false }) {
  const inputsRef = useRef([])

  // normalize: ۶ کاراکتر همیشه، جاهای خالی = ''
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '')

  useEffect(() => {
    // focus اولین خالی
    const idx = digits.findIndex((d) => !d)
    inputsRef.current[idx === -1 ? 5 : idx]?.focus()
  }, []) // eslint-disable-line

  function set(idx, char) {
    const nd = [...digits]
    nd[idx] = char
    onChange(nd.join(''))
  }

  function handleInput(idx, e) {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) return
    const ch = raw[raw.length - 1]
    set(idx, ch)
    if (idx < 5) inputsRef.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[idx]) {
        set(idx, '')
      } else if (idx > 0) {
        set(idx - 1, '')
        inputsRef.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx < 5) {
      inputsRef.current[idx + 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const nd = Array.from({ length: 6 }, (_, i) => pasted[i] || '')
    onChange(nd.join(''))
    inputsRef.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div
      style={{ display: 'flex', gap: '8px', justifyContent: 'center', direction: 'ltr' }}
    >
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleInput(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: '44px',
            height: '52px',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: '700',
            borderRadius: '12px',
            border: error
              ? '2px solid #f87171'
              : digit
                ? '2px solid #4F46E5'
                : '2px solid #e5e7eb',
            backgroundColor: error
              ? '#fef2f2'
              : digit
                ? '#eef2ff'
                : '#ffffff',
            color: error ? '#dc2626' : digit ? '#4F46E5' : '#111827',
            outline: 'none',
            transition: 'border-color 0.15s, background-color 0.15s',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  )
}
