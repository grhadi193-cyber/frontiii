import React from 'react'

export default function ShippingMethodCard({ method, selected, onSelect }) {
  const price = Number(method.cost ?? method.price ?? 0)
  const isFree = price === 0

  return (
    <label
      className={`
        relative flex gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
        ${selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'}
      `}
    >
      <input
        type="radio"
        name="shipping"
        value={method.id}
        checked={selected}
        onChange={() => onSelect(method)}
        className="sr-only"
      />
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
          transition-colors duration-200
          ${selected ? 'border-primary bg-primary' : 'border-gray-300'}
        `}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-gray-800">{method.name}</p>
            {method.estimated_days && (
              <p className="text-xs text-gray-500 mt-0.5">
                {method.estimated_days} روز کاری
              </p>
            )}
            {method.description && (
              <p className="text-xs text-gray-400 mt-1">{method.description}</p>
            )}
          </div>
          <div className="text-left flex-shrink-0">
            {isFree ? (
              <span className="text-sm font-bold text-green-600">رایگان</span>
            ) : (
              <span className="text-sm font-bold text-gray-800">
                {price.toLocaleString('fa-IR')} تومان
              </span>
            )}
          </div>
        </div>
      </div>
    </label>
  )
}
