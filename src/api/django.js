const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const { headers: optHeaders, ...restOptions } = options
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...optHeaders,
    },
    ...restOptions,
  })
  if (!res.ok) {
    let errMsg = `خطای سرور: ${res.status}`
    try {
      const errData = await res.json()
      errMsg = errData.detail || errData.message || errMsg
    } catch (_) {}
    throw new Error(errMsg)
  }
  if (res.status === 204) return null
  return res.json()
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// ── Settings ──────────────────────────────────
export function getSettings() {
  return request('/api/settings')
}

// ── Products ──────────────────────────────────
export function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return request(`/api/products${qs ? '?' + qs : ''}`)
}

export function getProduct(id) {
  return request(`/api/products/${id}`)
}

export function getCategories() {
  return request('/api/categories')
}

// ── Auth ──────────────────────────────────────
export function sendOtp(phone) {
  return request('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phone }),
  })
}

export function verifyOtp(phone, code) {
  return request('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phone, code }),
  })
}

export function login(phone, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phone, password }),
  })
}

export function getProfile(token) {
  return request('/api/auth/profile', {
    headers: authHeaders(token),
  })
}

export function updateProfileApi(token, data) {
  return request('/api/auth/profile', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export function changePassword(token, data) {
  return request('/api/auth/change-password', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export function forgotPassword(phone) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phone }),
  })
}

export function resetPassword(phone, code, new_password) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phone, code, new_password }),
  })
}

// ── Addresses ─────────────────────────────────
export function getAddresses(token) {
  return request('/api/auth/addresses', {
    headers: authHeaders(token),
  })
}

export function addAddress(token, data) {
  return request('/api/auth/addresses', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export function deleteAddress(token, id) {
  return request(`/api/auth/addresses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function setDefaultAddress(token, id) {
  return request(`/api/auth/addresses/${id}/set-default`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

// ── Shipping ──────────────────────────────────
export function getProvinces() {
  return request('/api/shipping/provinces')
}

export function getCities(provinceId) {
  return request(`/api/shipping/provinces/${provinceId}/cities`)
}

export function getShippingMethods() {
  return request('/api/shipping/methods')
}

export function calculateShipping(data) {
  return request('/api/shipping/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Orders ────────────────────────────────────
export function createOrder(token, data) {
  return request('/api/orders', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
}

export function getOrders(token) {
  return request('/api/auth/orders', {
    headers: authHeaders(token),
  })
}

export function getOrder(token, id) {
  return request(`/api/auth/orders/${id}`, {
    headers: authHeaders(token),
  })
}

export function cancelOrder(token, id) {
  return request(`/api/auth/orders/${id}/cancel`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}

// ── Payment ───────────────────────────────────
export function initiatePayment(token, orderId, idempotencyKey) {
  return request('/api/payment/initiate', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ order_id: orderId, idempotency_key: idempotencyKey }),
  })
}

const djangoApi = {
  getSettings,
  getProducts,
  getProduct,
  getCategories,
  sendOtp,
  verifyOtp,
  login,
  getProfile,
  updateProfileApi,
  changePassword,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  getProvinces,
  getCities,
  getShippingMethods,
  calculateShipping,
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  initiatePayment,
}

export default djangoApi
