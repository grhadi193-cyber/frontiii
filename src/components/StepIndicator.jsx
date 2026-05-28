import React from 'react'

const STEPS = [
  { id: 1, label: 'آدرس تحویل' },
  { id: 2, label: 'روش ارسال' },
  { id: 3, label: 'تأیید و پرداخت' },
]

export default function StepIndicator({ current }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const done    = step.id < current
          const active  = step.id === current
          const pending = step.id > current

          return (
            <React.Fragment key={step.id}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 shadow-sm
                    ${done    ? 'bg-green-500 text-white'         : ''}
                    ${active  ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                    ${pending ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
                  `}
                >
                  {done ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{String(step.id).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap
                    ${active  ? 'text-primary' : ''}
                    ${done    ? 'text-green-600' : ''}
                    ${pending ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-5 transition-colors duration-300
                    ${step.id < current ? 'bg-green-400' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
