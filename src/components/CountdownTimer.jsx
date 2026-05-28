import React, { useState, useEffect, useRef } from 'react'

/**
 * CountdownTimer
 * props:
 *   seconds: number (مدت زمان به ثانیه)
 *   onExpire: () => void
 *   onRestart: (cb: () => void) => void  ← والد این ref را می‌گیرد تا reset کند
 */
export default function CountdownTimer({ seconds = 120, onExpire, restartRef }) {
  const [remaining, setRemaining] = useState(seconds)
  const timerRef = useRef(null)

  function start(s = seconds) {
    setRemaining(s)
  }

  // expose restart به والد
  useEffect(() => {
    if (restartRef) restartRef.current = start
  }, [restartRef]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.()
      return
    }
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current)
          onExpire?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [remaining]) // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const pct = (remaining / seconds) * 100

  return (
    <span className={`font-mono text-sm tabular-nums ${remaining <= 30 ? 'text-red-500' : 'text-gray-500'}`}>
      {mm}:{ss}
    </span>
  )
}
