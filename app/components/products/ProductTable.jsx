'use client'

import { useState } from 'react'
import { Edit, MoreHorizontal, Package, Trash2 } from 'lucide-react'
import ProductImage from '../ui/ProductImage'

export default function ProductTable({ 
  products = [], 
  loading = false,
  selectedProducts = new Set(),
  onEditProduct,
  onDeleteProduct,
  onSelectProduct,
  onSelectAll,
  pagination,
  onPageChange
}) {
  const [localLoading, setLocalLoading] = useState(false)

  // Add defensive programming to handle missing product properties
  const safeProducts = products.map(product => ({
    id: product.id || '',
    name: product.name || 'Unnamed Product',
    sku: product.sku || 'N/A',
    barcode: product.barcode || 'N/A',
    category: product.category || 'uncategorized',
    price: product.price || 0,
    cost: product.cost || 0,
    stock: product.stock || 0,
    status: product.status || 'inactive',
    image: product.image || '/images/placeholder-product.jpg',
    // Handle both string and object image formats
    ...product
  }))

  const toggleSelectProduct = (productId) => {
    if (onSelectProduct) {
      onSelectProduct(productId);
    }
  }

  const toggleSelectAll = (checked) => {
    if (onSelectAll) {
      onSelectAll(checked);
    }
  }

  const getStockStatus = (stock, status) => {
    // Use status from backend if available, otherwise calculate from stock
    if (status === 'out_of_stock') {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    }
    if (status === 'low_stock') {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    }
    if (stock > 10) return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
    if (stock > 0) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleDeleteClick = async (productId) => {
    if (!onDeleteProduct) return
    
    setLocalLoading(true)
    try {
      await onDeleteProduct(productId)
    } finally {
      setLocalLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedProducts.size === safeProducts.length && safeProducts.length > 0}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              disabled={safeProducts.length === 0}
            />
            <span className="text-sm text-gray-600">
              {selectedProducts.size > 0 
                ? `${selectedProducts.size} selected` 
                : `${safeProducts.length} products`
              }
            </span>
          </div>
          
          {/* Pagination Info */}
          {pagination && (
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {/* Checkbox column */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {safeProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock, product.status)
              
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      disabled={localLoading}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg border border-gray-200"
                        fallbackSrc="/images/placeholder-product.jpg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {product.barcode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {product.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatCurrency(product.cost)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditProduct && onEditProduct(product)}
                        disabled={localLoading}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(product.id)}
                        disabled={localLoading}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {safeProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || localLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || localLoading}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}