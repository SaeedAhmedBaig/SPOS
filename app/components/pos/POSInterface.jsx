'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw, Package } from 'lucide-react'
import POSProductSearch from './POSProductSearch'
import POSProductGrid from './POSProductGrid'
import POSCart from './POSCart'
import POSPaymentModal from './POSPaymentModal'

export default function POSInterface() {
  const [cart, setCart] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('status', 'active') // Only fetch active products
      params.append('inStock', 'true') // Only fetch in-stock products

      const response = await fetch(`/api/products?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory])

  // Load products on component mount and when filters change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // F9 for quick checkout
      if (event.key === 'F9' && cart.length > 0) {
        event.preventDefault()
        setIsPaymentModalOpen(true)
      }
      // ESC to clear search or close modal
      if (event.key === 'Escape') {
        if (isPaymentModalOpen) {
          setIsPaymentModalOpen(false)
        } else if (searchQuery) {
          setSearchQuery('')
        }
      }
      // F5 to refresh products
      if (event.key === 'F5') {
        event.preventDefault()
        fetchProducts()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cart.length, isPaymentModalOpen, searchQuery, fetchProducts])

  const addToCart = useCallback((product) => {
    // Check if product is in stock
    if (product.stock !== undefined && product.stock <= 0) {
      setError(`"${product.name}" is out of stock`)
      return
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id)
      
      if (existingItem) {
        // Check stock limit
        if (product.stock !== undefined && existingItem.quantity >= product.stock) {
          setError(`Only ${product.stock} units of "${product.name}" available`)
          return currentCart
        }
        
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...currentCart, { 
          ...product, 
          quantity: 1,
          addedAt: new Date().toISOString()
        }]
      }
    })
  }, [])

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }

    // Check stock limit
    const product = products.find(p => p.id === productId)
    if (product && product.stock !== undefined && newQuantity > product.stock) {
      setError(`Only ${product.stock} units available`)
      return
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }, [products])

  const removeFromCart = useCallback((productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setError(null)
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cart])

  const handleCheckoutSuccess = useCallback(() => {
    setIsPaymentModalOpen(false)
    clearCart()
    // Refresh products to update stock levels
    fetchProducts()
  }, [clearCart, fetchProducts])

  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  const handleRetry = () => {
    setError(null)
    fetchProducts()
  }

  // Calculate cart summary for the modal
  const getCartSummary = useCallback(() => {
    const subtotal = getCartTotal()
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + tax

    return {
      subtotal,
      tax,
      total,
      itemCount: cart.reduce((count, item) => count + item.quantity, 0)
    }
  }, [cart, getCartTotal])

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        {/* Header with Search and Controls */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Point of Sale</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh products"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {products.length} products
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <POSProductSearch 
            onProductSelect={addToCart}
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            loading={loading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            </div>
          ) : products.length > 0 ? (
            <POSProductGrid 
              products={products} 
              onProductSelect={addToCart}
              loading={loading}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No products found</p>
              <p className="text-sm text-gray-700 mb-4">
                {searchQuery || selectedCategory ? 'Try adjusting your filters' : 'No products available'}
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>F9: Checkout</span>
            <span>ESC: Cancel</span>
            <span>F5: Refresh</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-gray-50 flex flex-col border-l border-gray-200">
        <POSCart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={() => setIsPaymentModalOpen(true)}
          isLoading={loading}
          taxRate={0.08}
        />
      </div>

      {/* Payment Modal */}
      <POSPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        cartSummary={getCartSummary()}
        onSuccess={handleCheckoutSuccess}
        onError={(error) => setError(error)}
      />
    </div>
  )
}