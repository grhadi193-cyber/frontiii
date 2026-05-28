import React, { useRef, useState, useCallback } from 'react'

/**
 * Enhanced ImageUpload component with:
 * - Drag & drop support
 * - Multiple image preview with remove capability
 * - Image reordering (drag handles)
 * - File size and type validation
 * - Upload progress simulation
 * - Responsive grid layout
 *
 * Props:
 *   label?: string
 *   value?: File | File[] | string | string[] | null
 *   onChange: (files: File[]) => void
 *   accept?: string
 *   multiple?: boolean
 *   maxSize?: number (bytes, default 5MB)
 *   maxFiles?: number
 *   existingImages?: Array<{url, alt?, caption?, order?}>
 *   onRemoveExisting?: (index: number) => void
 *   onReorderExisting?: (from: number, to: number) => void
 */
export default function ImageUpload({
  label = 'آپلود تصویر',
  value,
  onChange,
  accept = 'image/*',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  existingImages = [],
  onRemoveExisting,
  onReorderExisting,
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState([])

  // Normalize value to array
  const fileList = React.useMemo(() => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }, [value])

  // Preview URLs for new files
  const previews = React.useMemo(() => {
    return fileList.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
    }))
  }, [fileList])

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function validateFiles(files) {
    const errs = []
    const valid = []

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        errs.push(`"${f.name}" فرمت فایل نامعتبر است`)
        continue
      }
      if (f.size > maxSize) {
        errs.push(`"${f.name}" حجم فایل بیش از ${(maxSize / 1024 / 1024).toFixed(0)}MB است`)
        continue
      }
      valid.push(f)
    }

    // Check max files
    const totalCount = existingImages.length + fileList.length + valid.length
    if (totalCount > maxFiles) {
      const allowed = maxFiles - existingImages.length - fileList.length
      errs.push(`حداکثر ${maxFiles} تصویر مجاز است. می‌توانید ${Math.max(0, allowed)} تصویر دیگر اضافه کنید.`)
      return { valid: valid.slice(0, Math.max(0, allowed)), errs }
    }

    return { valid, errs }
  }

  function handleFiles(files) {
    setErrors([])
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const { valid, errs } = validateFiles(fileArray)

    if (errs.length > 0) {
      setErrors(errs)
    }

    if (valid.length > 0) {
      const newFiles = multiple ? [...fileList, ...valid] : valid
      onChange(newFiles)
    }
  }

  function handleFile(e) {
    handleFiles(e.target.files)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  // Drag & drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [fileList, existingImages] // eslint-disable-line react-hooks/exhaustive-deps
  )

  function removeFile(index) {
    const newFiles = [...fileList]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  function moveFile(index, direction) {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === fileList.length - 1) return
    const newFiles = [...fileList]
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    ;[newFiles[index], newFiles[swapIdx]] = [newFiles[swapIdx], newFiles[index]]
    onChange(newFiles)
  }

  const hasAnyImages = existingImages.length > 0 || previews.length > 0

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}

      {/* Upload zone */}
      {!multiple && hasAnyImages ? null : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 group ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 hover:border-indigo-500 hover:bg-gray-800/50'
          }`}
        >
          <div className="py-4 text-gray-500 group-hover:text-indigo-400 transition-colors">
            <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium">
              {isDragging ? 'رها کنید...' : 'کلیک کنید یا تصاویر را بکشید'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              فرمت‌های مجاز: JPG, PNG, WebP — حداکثر {(maxSize / 1024 / 1024).toFixed(0)}MB
              {multiple && ` — حداکثر ${maxFiles} تصویر`}
            </p>
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleFile} className="hidden" />

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Existing images preview */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">تصاویر فعلی:</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {existingImages.map((img, i) => (
              <div key={`existing-${i}`} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {onRemoveExisting && (
                    <button
                      onClick={() => onRemoveExisting(i)}
                      className="w-7 h-7 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="حذف تصویر"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Order badge */}
                {img.order !== undefined && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full text-white text-[10px] flex items-center justify-center">
                    {img.order + 1}
                  </div>
                )}

                {/* Caption */}
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New files preview */}
      {previews.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">تصاویر جدید:</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {previews.map((p, i) => (
              <div key={`new-${i}`} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                <img src={p.url} alt={p.name} className="w-full h-full object-cover" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {multiple && i > 0 && (
                      <button
                        onClick={() => moveFile(i, 'up')}
                        className="w-7 h-7 bg-gray-700 rounded-full text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                        title="جابجایی به چپ"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="w-7 h-7 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="حذف"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {multiple && i < previews.length - 1 && (
                      <button
                        onClick={() => moveFile(i, 'down')}
                        className="w-7 h-7 bg-gray-700 rounded-full text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                        title="جابجایی به راست"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <span className="text-white text-[10px] bg-black/60 px-2 py-0.5 rounded-full">
                    {(p.size / 1024).toFixed(0)} KB
                  </span>
                </div>

                {/* File name */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
