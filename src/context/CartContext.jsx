import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'afi_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  // هر بار items تغییر کرد، ذخیره کن
  useEffect(() => {
    saveCart(items)
  }, [items])

  // اضافه کردن آیتم (اگر موجود بود، تعداد را اضافه کن)
  function addItem(product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id)
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.product_id
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        )
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }]
    })
  }

  // حذف آیتم
  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }

  // تغییر تعداد
  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    )
  }

  // خالی کردن سبد
  function clearCart() {
    setItems([])
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const value = {
    items,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart باید داخل CartProvider استفاده شود')
  return ctx
}

export default CartContext
