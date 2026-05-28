import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getProducts as fetchProductsFromDjango,
  getProduct  as fetchProductFromDjango,
} from '../api/django.js'
import {
  getProductImages,
  getProductImagesBatch,
  pbImageUrl,
} from '../api/pocketbase.js'

const PRODUCTS_KEY = 'products'
const PRODUCT_KEY  = 'product'

// ─── helpers ──────────────────────────────────────────────────────────────────

function extractImages(records, productName) {
  const sorted = [...records].sort((a, b) => {
    const oa = a.order ?? 0
    const ob = b.order ?? 0
    if (oa !== ob) return oa - ob
    return new Date(a.created) - new Date(b.created)
  })

  return sorted
    .flatMap((r) => {
      // images ممکنه آرایه باشه (Multiple) یا string (Single) یا خالی
      let files = []
      if (Array.isArray(r.images)) {
        files = r.images.filter(Boolean)
      } else if (typeof r.images === 'string' && r.images.trim()) {
        files = [r.images.trim()]
      }

      if (files.length > 0) {
        return files.map((img) => ({
          url:        pbImageUrl(r, img),
          alt:        r.alt_text || productName,
          caption:    r.caption  || '',
          order:      r.order    ?? 0,
          pbRecordId: r.id,
          filename:   img,
        }))
      }
      // fallback به فیلد image تکی
      if (r.image && typeof r.image === 'string' && r.image.trim()) {
        return [{
          url:        pbImageUrl(r, r.image.trim()),
          alt:        r.alt_text || productName,
          caption:    r.caption  || '',
          order:      r.order    ?? 0,
          pbRecordId: r.id,
          filename:   r.image.trim(),
        }]
      }
      return []
    })
    .filter(Boolean)
}

function extractFeatures(records) {
  for (const r of records) {
    if (!r.features) continue
    try {
      const parsed = typeof r.features === 'string' ? JSON.parse(r.features) : r.features
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (_) { /* ignore */ }
  }
  return []
}

// ─── merge single product ──────────────────────────────────────────────────

function mergeProduct(product, pbRecords = []) {
  const images   = extractImages(pbRecords, product.name)
  const features = extractFeatures(pbRecords)

  // fallback به تصویر Django اگر PocketBase خالی باشد
  if (images.length === 0 && product.image) {
    images.push({ url: product.image, alt: product.name, caption: '', order: 0 })
  }

  return {
    ...product,
    gallery:      images,
    primaryImage: images.length > 0 ? images[0].url : null,
    features:     features.length > 0 ? features : (product.features || []),
    _pbRecord:    pbRecords[0] || null,
  }
}

// ─── fetch functions ───────────────────────────────────────────────────────

async function fetchProducts({ page, pageSize, categoryId, search }) {
  const params = { page, page_size: pageSize }
  if (categoryId) params.category_id = categoryId
  if (search)     params.search       = search

  const data  = await fetchProductsFromDjango(params)
  const items = data?.results || (Array.isArray(data) ? data : [])
  const count = data?.count   || items.length

  const productIds = items.map((p) => p.id)
  const pbMap      = await getProductImagesBatch(productIds)

  // pbMap key ممکنه Number باشه — هر دو حالت رو چک می‌کنیم
  const mergedItems = items.map((product) =>
    mergeProduct(product, pbMap[product.id] || pbMap[String(product.id)] || [])
  )

  return {
    items:      mergedItems,
    count,
    totalPages: Math.ceil(count / pageSize) || 1,
  }
}

async function fetchProduct(id) {
  const [product, pbRecords] = await Promise.all([
    fetchProductFromDjango(id),
    getProductImages(id),
  ])
  return mergeProduct(product, pbRecords)
}

// ─── React Query hooks ─────────────────────────────────────────────────────

export function useProducts({
  page       = 1,
  pageSize   = 12,
  categoryId = null,
  search     = '',
} = {}) {
  return useQuery({
    queryKey:        [PRODUCTS_KEY, { page, pageSize, categoryId, search }],
    queryFn:         () => fetchProducts({ page, pageSize, categoryId, search }),
    staleTime:       1000 * 60 * 3,
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey:  [PRODUCT_KEY, id],
    queryFn:   () => fetchProduct(id),
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRefreshProducts() {
  const queryClient = useQueryClient()
  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY] })
    },
    refreshProduct: (id) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY, id] })
    },
  }
}

export { PRODUCTS_KEY, PRODUCT_KEY }
export default useProducts
