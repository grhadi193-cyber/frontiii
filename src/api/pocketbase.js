import PocketBase from 'pocketbase'

const PB_URL = import.meta.env.VITE_PB_URL || 'http://localhost:8090'

export const pb = new PocketBase(PB_URL)
pb.autoCancellation(false)

// ─── pbImageUrl ────────────────────────────────────────────────────────────
// همه جا با ۲ پارامتر صدا زده میشه: pbImageUrl(record, filename)
export function pbImageUrl(record, filename, opts = {}) {
  if (!record || !filename) return ''
  return pb.files.getUrl(record, filename, opts)
}

// ─── Products ──────────────────────────────────────────────────────────────
// عکس‌های یک محصول رو از products_ui می‌خونه
export async function getProductImages(productId) {
  if (!productId) return []
  try {
    return await pb.collection('products_ui').getFullList({
      filter: `product_id = "${productId}"`,
      sort:   'order,created',
    })
  } catch (err) {
    console.warn(`[PB] getProductImages(${productId}):`, err.message)
    return []
  }
}

// عکس‌های چند محصول رو یکجا می‌خونه — یه request به جای N تا
export async function getProductImagesBatch(productIds) {
  if (!productIds || productIds.length === 0) return {}
  try {
    const filter = productIds.map((id) => `product_id = "${id}"`).join(' || ')
    const records = await pb.collection('products_ui').getFullList({
      filter,
      sort: 'order,created',
    })
    // گروه‌بندی بر اساس product_id
    const map = {}
    for (const r of records) {
      const pid = String(r.product_id)
      if (!map[pid]) map[pid] = []
      map[pid].push(r)
    }
    return map
  } catch (err) {
    console.warn('[PB] getProductImagesBatch:', err.message)
    return {}
  }
}

// ─── Banners ───────────────────────────────────────────────────────────────
export async function getBanners() {
  try {
    return await pb.collection('banners').getFullList({ sort: 'order' })
  } catch (err) {
    console.warn('[PB] getBanners:', err.message)
    return []
  }
}

// ─── Partners ──────────────────────────────────────────────────────────────
export async function getPartners() {
  try {
    return await pb.collection('partners').getFullList({ sort: 'order' })
  } catch (err) {
    console.warn('[PB] getPartners:', err.message)
    return []
  }
}

// ─── Blogs ─────────────────────────────────────────────────────────────────
export async function getBlogs(page = 1, perPage = 9) {
  try {
    const result = await pb.collection('blogs').getList(page, perPage, {
      sort:   '-created',
      filter: 'published = true',
    })
    return {
      items:      result.items,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    }
  } catch (err) {
    console.warn('[PB] getBlogs:', err.message)
    return { items: [], totalPages: 1, totalItems: 0 }
  }
}

export async function getBlog(slug) {
  try {
    return await pb.collection('blogs').getFirstListItem(`slug = "${slug}"`)
  } catch (err) {
    console.warn(`[PB] getBlog(${slug}):`, err.message)
    return null
  }
}

// ─── Site Config ───────────────────────────────────────────────────────────
export async function getSiteConfig() {
  try {
    const records = await pb.collection('site_config').getFullList({ limit: 1 })
    return records[0] || null
  } catch (err) {
    console.warn('[PB] getSiteConfig:', err.message)
    return null
  }
}

// ─── Pages ─────────────────────────────────────────────────────────────────
export async function getPage(slug) {
  try {
    return await pb.collection('pages').getFirstListItem(`slug = "${slug}"`)
  } catch (err) {
    console.warn(`[PB] getPage(${slug}):`, err.message)
    return null
  }
}
