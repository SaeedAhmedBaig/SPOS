'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Package, ArrowUpRight } from 'lucide-react'

export default function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/inventory/low-stock?limit=5')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch low stock products: ${response.status}`)
      }
      
      const data = await response.json()
      setLowStockProducts(data.products || [])
    } catch (err) {
      console.error('Error fetching low stock products:', err)
      setError(err.message)
      // Fallback to empty array to prevent UI breakage
      setLowStockProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getStockLevel = (current, min) => {
    if (current === 0) return 'out-of-stock'
    const percentage = (current / min) * 100
    if (percentage <= 25) return 'critical'
    if (percentage <= 50) return 'warning'
    return 'low'
  }

  const getStockColor = (level) => {
    switch (level) {
      case 'out-of-stock': return 'bg-red-50 text-red-700 border-red-200'
      case 'critical': return 'bg-red-50 text-red-700 border-red-200'
      case 'warning': return 'bg-orange-50 text-orange-700 border-orange-200'
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const getStockIconColor = (level) => {
    switch (level) {
      case 'out-of-stock': return 'text-red-600'
      case 'critical': return 'text-red-600'
      case 'warning': return 'text-orange-600'
      default: return 'text-yellow-600'
    }
  }

  const getStockBackground = (level) => {
    switch (level) {
      case 'out-of-stock': return 'bg-red-100'
      case 'critical': return 'bg-red-100'
      case 'warning': return 'bg-orange-100'
      default: return 'bg-yellow-100'
    }
  }

  const handleViewAll = () => {
    // Navigate to inventory page with low stock filter
    window.location.href = '/inventory?filter=low-stock'
  }

  const handleRetry = () => {
    fetchLowStockProducts()
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between w-full p-6 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <p className="text-sm text-gray-600 mt-1">Failed to load stock data</p>
          </div>
        </div>
        <div className="w-full p-6 text-center">
          <div className="text-red-600 mb-3">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-700 mb-4">Unable to load low stock products</p>
          <button
            onClick={handleRetry}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between w-full p-6 border-b border-gray-100">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          <p className="text-sm text-gray-600 mt-1">Products needing restock</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!loading && (
            <>
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                lowStockProducts.length > 0 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {lowStockProducts.length}
              </span>
              <button 
                onClick={handleViewAll}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="w-full p-6 space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="text-right flex-shrink-0 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : lowStockProducts.length > 0 ? (
          lowStockProducts.map((product) => {
            const stockLevel = getStockLevel(product.currentStock, product.minStock || product.reorderLevel)
            
            return (
              <div
                key={product.id}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border ${getStockColor(stockLevel)} transition-colors hover:shadow-sm`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getStockBackground(stockLevel)}`}>
                  <AlertTriangle className={`w-4 h-4 ${getStockIconColor(stockLevel)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-600">{product.category?.name || product.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600 truncate">SKU: {product.sku}</span>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold whitespace-nowrap ${
                    stockLevel === 'out-of-stock' ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    {product.currentStock === 0 ? 'Out of stock' : `${product.currentStock} left`}
                  </p>
                  <p className="text-xs text-gray-600">
                    Min: {product.minStock || product.reorderLevel}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">All products are well stocked</p>
            <p className="text-sm text-gray-600 mt-1">No low stock alerts</p>
          </div>
        )}
      </div>
    </div>
  )
}