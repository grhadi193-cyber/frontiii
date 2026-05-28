import React from 'react'

export default function AddressCard({ address, selected, onSelect }) {
  // ✅ بک‌اند AddressOut فیلد province و city برمی‌گرداند (نه province_name/city_name)
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
        name="address"
        value={address.id}
        checked={selected}
        onChange={() => onSelect(address)}
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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-gray-800">
            {address.title || 'آدرس'}
          </span>
          {address.is_default && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              پیش‌فرض
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {address.province && `${address.province}، `}
          {address.city && `${address.city}، `}
          {address.street}
        </p>
        {address.postal_code && (
          <p className="text-xs text-gray-400 mt-1">
            کد پستی: {address.postal_code}
          </p>
        )}
      </div>
    </label>
  )
}
