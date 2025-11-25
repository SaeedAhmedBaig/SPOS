'use client'

import { useState } from 'react'
import { Trash2, ShoppingCart, Plus, Minus, AlertCircle, Loader } from 'lucide-react'
import ProductImage from '../ui/ProductImage'

export default function POSCart({ 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onCheckout,
  isLoading = false,
  taxRate = 0.08 // Default 8% tax
}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  const getSubtotal = () => {
    if (!cart || !Array.isArray(cart)) return 0
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity) || 0
      return total + (price * quantity)
    }, 0)
  }

  const getTax = () => {
    const subtotal = getSubtotal()
    return subtotal * taxRate
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const handleCheckout = async () => {
    if (isProcessing || isLoading) return
    
    try {
      setIsProcessing(true)
      setError(null)
      await onCheckout()
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to process checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 0) return
    if (newQuantity === 0) {
      onRemoveItem(productId)
      return
    }
    onUpdateQuantity(productId, newQuantity)
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the entire cart? This action cannot be undone.')) {
      onClearCart()
    }
  }

  if (!cart || !Array.isArray(cart)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
        <AlertCircle className="w-16 h-16 mb-4 text-red-300" />
        <p className="text-lg font-medium text-gray-900">Cart Error</p>
        <p className="text-sm text-gray-700">Unable to load cart data</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
        <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
        <p className="text-sm text-gray-700">Add products to get started</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
            <button
              onClick={handleClearCart}
              disabled={isProcessing}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item) => (
          <div 
            key={`${item.id}-${item.quantity}`} 
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
          >
            {/* Product Image */}
            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
              <ProductImage
                src={item.image}
                alt={item.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                showIcon={true}
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-gray-700 text-sm">{formatCurrency(item.price)} each</p>
                {item.stock !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    item.stock < 10 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    Stock: {item.stock}
                  </span>
                )}
              </div>
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={isProcessing || item.quantity <= 1}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-medium text-gray-900 text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                disabled={isProcessing || (item.stock !== undefined && item.quantity >= item.stock)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            {/* Price and Remove */}
            <div className="text-right min-w-0 flex-shrink-0">
              <p className="font-semibold text-gray-900 text-sm">
                {formatCurrency((item.price * item.quantity))}
              </p>
              <button
                onClick={() => onRemoveItem(item.id)}
                disabled={isProcessing}
                className="text-red-500 hover:text-red-700 mt-1 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
        {/* Summary Lines */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Tax ({(taxRate * 100).toFixed(0)}%)</span>
            <span className="font-medium text-gray-900">{formatCurrency(getTax())}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-gray-300 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(getTotal())}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing || isLoading || cart.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Process Payment (${formatCurrency(getTotal())})`
          )}
        </button>

        {/* Additional Info */}
        <div className="text-xs text-gray-600 text-center">
          <p>Press F9 for quick checkout • ESC to cancel</p>
        </div>
      </div>
    </div>
  )
}