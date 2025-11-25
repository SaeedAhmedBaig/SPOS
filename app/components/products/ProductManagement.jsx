'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Package, AlertCircle, RefreshCw } from 'lucide-react'
import ProductTable from './ProductTable'
import ProductFilters from './ProductFilters'
import ProductModal from './ProductModal'
import BulkActionsModal from './BulkActionsModal'

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory })
      })

      const response = await fetch(`/api/products?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const data = await response.json()
      setProducts(data.products || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1
      }))
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, pagination.page, pagination.limit])

  // Load products on component mount and when filters change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    setSelectedProducts(new Set())
  }, [searchTerm, selectedCategory])

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    // Refresh products after modal closes (in case of updates)
    fetchProducts()
  }

  const handleBulkAction = () => {
    if (selectedProducts.size === 0) {
      setError('Please select products to perform bulk actions')
      return
    }
    setIsBulkModalOpen(true)
  }

  const handleBulkActionComplete = () => {
    setIsBulkModalOpen(false)
    setSelectedProducts(new Set())
    fetchProducts()
  }

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(productId)) {
        newSelection.delete(productId)
      } else {
        newSelection.add(productId)
      }
      return newSelection
    })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = products.map(product => product.id)
      setSelectedProducts(new Set(allIds))
    } else {
      setSelectedProducts(new Set())
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`)
      }

      // Refresh the product list
      await fetchProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      setError(err.message)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    setSelectedProducts(new Set())
  }

  const handleExport = async (filters) => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...(filters && { filters: JSON.stringify(filters) })
      })

      const response = await fetch(`/api/products/export?${params}`)
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message)
    }
  }

  const handleImport = async () => {
    // This would typically open an import modal or file picker
    // For now, we'll just show a message
    setError('Import functionality would open a file picker in a real implementation')
  }

  const handleRetry = () => {
    setError(null)
    fetchProducts()
  }

  const getFilteredCount = () => {
    if (searchTerm || selectedCategory !== 'all') {
      return products.length
    }
    return pagination.total
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-gray-700 mt-1">Manage your product inventory and pricing</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Refresh Button */}
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh products"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bulk Actions Button */}
          {selectedProducts.size > 0 && (
            <button
              onClick={handleBulkAction}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>Bulk Actions ({selectedProducts.size})</span>
            </button>
          )}

          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onExport={handleExport}
        onImport={handleImport}
        onAddProduct={handleAddProduct}
        loading={loading}
        totalProducts={pagination.total}
        filteredCount={getFilteredCount()}
      />

      {/* Products Table or Empty State */}
      {!loading && products.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-700 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first product'
            }
          </p>
          {(searchTerm || selectedCategory !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleAddProduct}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          )}
        </div>
      ) : (
        /* Products Table */
        <ProductTable
          products={products}
          loading={loading}
          selectedProducts={selectedProducts}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onSelectProduct={handleSelectProduct}
          onSelectAll={handleSelectAll}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedProductIds={Array.from(selectedProducts)}
        onComplete={handleBulkActionComplete}
      />
    </div>
  )
}