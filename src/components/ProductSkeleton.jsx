import React from 'react'

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
        <div className="h-5 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

export function ProductSkeletonGrid({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
