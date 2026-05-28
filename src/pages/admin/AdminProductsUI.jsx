import React, { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { pb, pbImageUrl } from '../../api/pocketbase.js'
import ImageUpload from '../../components/admin/ImageUpload.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { useRefreshProducts } from '../../hooks/useProducts.js'

const PB_COLLECTION = 'products_ui'

/**
 * AdminProductsUI — Image management for products.
 * Frontend exclusively manages product images (gallery).
 * Product data (name, price, etc.) comes from Django backend only.
 */
export default function AdminProductsUI() {
  const queryClient = useQueryClient()
  const { refresh } = useRefreshProducts()

  // ── Data ────────────────────────────────────────────────────
  const {
    data: records = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['admin', PB_COLLECTION],
    queryFn: async () => {
      const data = await pb.collection(PB_COLLECTION).getFullList({
        sort: '-created',
      })
      return data
    },
    staleTime: 1000 * 60, // 1 minute
  })

  // ── Filter / Search ─────────────────────────────────────────
  const [productIdFilter, setProductIdFilter] = useState('')
  const [searchId, setSearchId] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    setSearchId(productIdFilter)
  }

  function handleClearFilter() {
    setProductIdFilter('')
    setSearchId('')
  }

  // Filtered records for display
  const filteredRecords = React.useMemo(() => {
    if (!searchId) return records
    return records.filter((r) => String(r.product_id) === searchId)
  }, [records, searchId])

  // ── Modal state ─────────────────────────────────────────────
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [featuresJson, setFeaturesJson] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Form fields
  const [formProductId, setFormProductId] = useState('')
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)

  // Delete image confirmation
  const [deleteImg, setDeleteImg] = useState(null)
  const [deletingImg, setDeletingImg] = useState(false)

  // Delete record confirmation
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [deletingRecord, setDeletingRecord] = useState(false)

  // ── CRUD operations ─────────────────────────────────────────

  function openAdd() {
    setEditing(null)
    setFormProductId(productIdFilter || '')
    setImageFiles([])
    setFeaturesJson('')
    setAltText('')
    setCaption('')
    setDisplayOrder(0)
    setFormError('')
    setModal(true)
  }

  function openEdit(row) {
    setEditing(row)
    setFormProductId(String(row.product_id || ''))
    setImageFiles([])
    setFeaturesJson(row.features ? JSON.stringify(row.features, null, 2) : '')
    setAltText(row.alt_text || '')
    setCaption(row.caption || '')
    setDisplayOrder(row.order ?? 0)
    setFormError('')
    setModal(true)
  }

  function validateForm() {
    if (!formProductId || isNaN(Number(formProductId))) {
      return 'Product ID معتبر وارد کنید'
    }
    if (!editing && imageFiles.length === 0) {
      return 'حداقل یک تصویر انتخاب کنید'
    }
    if (featuresJson.trim()) {
      try {
        JSON.parse(featuresJson)
      } catch {
        return 'JSON ویژگی‌ها نامعتبر است'
      }
    }
    return null
  }

  async function handleSave() {
    setFormError('')

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('product_id', Number(formProductId))
      fd.append('alt_text', altText)
      fd.append('caption', caption)
      fd.append('order', displayOrder)

      if (featuresJson.trim()) {
        fd.append('features', featuresJson.trim())
      }

      for (const f of imageFiles) {
        fd.append('images', f)
      }

      if (editing) {
        await pb.collection(PB_COLLECTION).update(editing.id, fd)
      } else {
        await pb.collection(PB_COLLECTION).create(fd)
      }

      // Invalidate caches to sync frontend product data
      queryClient.invalidateQueries({ queryKey: ['admin', PB_COLLECTION] })
      refresh()

      setModal(false)
      setEditing(null)
      setImageFiles([])
    } catch (e) {
      setFormError(e.message || 'خطا در ذخیره — دوباره تلاش کنید')
    }
    setSaving(false)
  }

  async function handleDeleteImage() {
    if (!deleteImg) return
    setDeletingImg(true)
    try {
      const current = deleteImg.record.images || []
      const updated = current.filter((f) => f !== deleteImg.filename)
      await pb.collection(PB_COLLECTION).update(deleteImg.record.id, { images: updated })

      queryClient.invalidateQueries({ queryKey: ['admin', PB_COLLECTION] })
      refresh()

      setDeleteImg(null)
    } catch (e) {
      console.error(e)
    }
    setDeletingImg(false)
  }

  async function handleDeleteRecord() {
    if (!deleteRecord) return
    setDeletingRecord(true)
    try {
      await pb.collection(PB_COLLECTION).delete(deleteRecord.id)

      queryClient.invalidateQueries({ queryKey: ['admin', PB_COLLECTION] })
      refresh()

      setDeleteRecord(null)
    } catch (e) {
      console.error(e)
    }
    setDeletingRecord(false)
  }

  // ── Table columns ───────────────────────────────────────────
  const columns = [
    {
      key: 'product_id',
      label: 'Product ID',
      render: (val) => <span className="font-mono text-indigo-400" dir="ltr">{val}</span>,
      sortable: true,
    },
    {
      key: 'images',
      label: 'تصاویر',
      render: (_, row) => {
        const imgs = row.images || []
        if (imgs.length === 0) return <span className="text-gray-600 text-xs">بدون تصویر</span>
        return (
          <div className="flex -space-x-2 space-x-reverse">
            {imgs.slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={pbImageUrl(row, img)}
                alt=""
                className="w-10 h-10 rounded-lg object-cover border-2 border-gray-800 bg-gray-800"
              />
            ))}
            {imgs.length > 3 && (
              <div className="w-10 h-10 rounded-lg bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-xs text-gray-400">
                +{imgs.length - 3}
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'order',
      label: 'ترتیب',
      render: (val) => <span className="text-gray-400">{val ?? 0}</span>,
      sortable: true,
    },
    {
      key: 'alt_text',
      label: 'Alt Text',
      render: (val) => <span className="text-gray-400 text-xs truncate max-w-[120px] block">{val || '—'}</span>,
    },
    {
      key: 'updated',
      label: 'آخرین بروزرسانی',
      render: (val) => (
        <span className="text-gray-500 text-xs" dir="ltr">
          {val ? new Date(val).toLocaleDateString('fa-IR') : '—'}
        </span>
      ),
      sortable: true,
    },
  ]

  // ── Existing images for edit modal ──────────────────────────
  const existingImages = React.useMemo(() => {
    if (!editing || !editing.images) return []
    return editing.images.map((img, i) => ({
      url: pbImageUrl(editing, img),
      alt: editing.alt_text || '',
      caption: editing.caption || '',
      order: i,
    }))
  }, [editing])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">مدیریت تصاویر محصولات</h1>
          <p className="text-sm text-gray-500 mt-1">تصاویر گالری محصولات — فقط در فرانت مدیریت می‌شوند</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          افزودن تصاویر
        </button>
      </div>

      {/* Query error */}
      {queryError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
          خطا در بارگذاری: {queryError.message}
        </div>
      )}

      {/* Filter */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="number"
          value={productIdFilter}
          onChange={(e) => setProductIdFilter(e.target.value)}
          placeholder="فیلتر بر اساس Product ID"
          className="flex-1 max-w-xs bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          dir="ltr"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-colors"
        >
          فیلتر
        </button>
        <button
          type="button"
          onClick={handleClearFilter}
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-xl transition-colors"
        >
          همه
        </button>
      </form>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        onEdit={openEdit}
        onDelete={setDeleteRecord}
        loading={loading}
        searchable
        searchPlaceholder="جستجو در Product ID یا Alt Text..."
        searchFields={['product_id', 'alt_text', 'caption']}
        title={`${filteredRecords.length} رکورد`}
      />

      {/* ── Add/Edit Modal ────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/70" onClick={() => !saving && setModal(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">
              {editing ? `ویرایش تصاویر محصول #${editing.product_id}` : 'افزودن تصاویر جدید'}
            </h2>

            {formError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              {/* Product ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Product ID <span className="text-red-400">*</span>
                  <span className="text-gray-600 font-normal mr-1">(شناسه محصول در Django)</span>
                </label>
                <input
                  type="number"
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  disabled={!!editing}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  dir="ltr"
                  placeholder="مثال: 42"
                />
              </div>

              {/* Image Upload */}
              <ImageUpload
                label={editing ? 'افزودن تصاویر جدید' : 'آپلود تصاویر'}
                onChange={setImageFiles}
                multiple
                maxFiles={10}
                existingImages={existingImages}
                onRemoveExisting={(idx) => {
                  const img = editing.images?.[idx]
                  if (img) setDeleteImg({ record: editing, filename: img })
                }}
              />

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Alt Text (متن جایگزین)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="توضیح تصویر برای سئو و دسترسی"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Caption (زیرنویس)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="زیرنویس نمایشی تصویر"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">ترتیب نمایش</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dir="ltr"
                />
              </div>

              {/* Features JSON */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  ویژگی‌ها (JSON)
                  <span className="text-gray-600 font-normal mr-1">— اختیاری</span>
                </label>
                <textarea
                  value={featuresJson}
                  onChange={(e) => setFeaturesJson(e.target.value)}
                  rows={5}
                  placeholder={`[\n  "وزن: ۲۵۰ گرم",\n  "باتری: ۵۰۰۰ میلی‌آمپر",\n  "گارانتی: ۱۲ ماه"\n]`}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  dir="ltr"
                />
                <p className="text-xs text-gray-600 mt-1">
                  آرایه‌ای از رشته‌ها — هر آیتم یک ویژگی محصول
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setModal(false)}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {saving ? 'در حال ذخیره...' : editing ? 'بروزرسانی' : 'ذخیره'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete image confirmation */}
      <ConfirmModal
        open={!!deleteImg}
        title="حذف تصویر"
        message="این تصویر از محصول حذف شود؟"
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteImg(null)}
        loading={deletingImg}
      />

      {/* Delete record confirmation */}
      <ConfirmModal
        open={!!deleteRecord}
        title="حذف رکورد"
        message={`رکورد تصاویر محصول #${deleteRecord?.product_id} حذف شود؟ تمام تصاویر مرتبط پاک خواهند شد.`}
        onConfirm={handleDeleteRecord}
        onCancel={() => setDeleteRecord(null)}
        loading={deletingRecord}
      />
    </div>
  )
}
