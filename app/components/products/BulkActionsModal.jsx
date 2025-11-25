'use client'

import { useState, useCallback } from 'react'
import { X, Trash2, Tag, Package, Download, AlertCircle, Loader, CheckCircle } from 'lucide-react'

export default function BulkActionsModal({ isOpen, onClose, selectedProductIds, onComplete }) {
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('active')
  const [selectedCategory, setSelectedCategory] = useState('')

  const actions = [
    { id: 'delete', name: 'Delete Products', icon: Trash2, color: 'text-red-600', description: 'Permanently remove selected products' },
    { id: 'update_status', name: 'Update Status', icon: Tag, color: 'text-blue-600', description: 'Change product status (Active/Inactive)' },
    { id: 'update_category', name: 'Update Category', icon: Package, color: 'text-green-600', description: 'Change product categories' },
    { id: 'export', name: 'Export Selected', icon: Download, color: 'text-purple-600', description: 'Export selected products to CSV' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
  ]

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'computers', label: 'Computers' },
    { value: 'audio', label: 'Audio' },
    { value: 'wearables', label: 'Wearables' },
    { value: 'accessories', label: 'Accessories' },
  ]

  const resetForm = () => {
    setAction('')
    setLoading(false)
    setError(null)
    setSuccess(false)
    setSelectedStatus('active')
    setSelectedCategory('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!action) {
      setError('Please select an action')
      return
    }

    try {
      setLoading(true)
      setError(null)

      let payload = {
        productIds: selectedProductIds,
        action: action
      }

      // Add action-specific data
      if (action === 'update_status') {
        payload.status = selectedStatus
      } else if (action === 'update_category') {
        if (!selectedCategory) {
          setError('Please select a category')
          return
        }
        payload.category = selectedCategory
      }

      const response = await fetch('/api/products/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Bulk action failed: ${response.status}`)
      }

      const result = await response.json()
      
      setSuccess(true)
      
      // Call completion callback after a brief delay
      setTimeout(() => {
        onComplete?.(result)
        handleClose()
      }, 2000)
      
    } catch (err) {
      console.error('Bulk action error:', err)
      setError(err.message || 'Failed to perform bulk action')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        productIds: selectedProductIds.join(','),
        format: 'csv'
      })

      const response = await fetch(`/api/products/export?${params}`)
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `selected-products-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess(true)
      setTimeout(() => {
        onComplete?.()
        handleClose()
      }, 1500)
      
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message || 'Failed to export products')
    } finally {
      setLoading(false)
    }
  }

  const getActionDescription = () => {
    const selectedAction = actions.find(a => a.id === action)
    return selectedAction?.description || 'Select an action to perform on the selected products'
  }

  const getConfirmationMessage = () => {
    switch (action) {
      case 'delete':
        return `Are you sure you want to permanently delete ${selectedProductIds.length} products? This action cannot be undone.`
      case 'update_status':
        return `Update status of ${selectedProductIds.length} products to "${selectedStatus}"?`
      case 'update_category':
        const category = categoryOptions.find(c => c.value === selectedCategory)?.label
        return `Update category of ${selectedProductIds.length} products to "${category}"?`
      default:
        return `Perform this action on ${selectedProductIds.length} products?`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Actions</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <div>
                <span className="font-medium">Action completed successfully!</span>
                <p className="text-sm text-green-600 mt-1">
                  {action === 'export' 
                    ? 'Your export has been downloaded' 
                    : `Updated ${selectedProductIds.length} products`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!success && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Selected Products Count */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedProductIds.length} products selected
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Choose an action to perform on all selected products
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Action
              </label>
              <div className="space-y-2">
                {actions.map((actionItem) => {
                  const Icon = actionItem.icon
                  return (
                    <button
                      key={actionItem.id}
                      type="button"
                      onClick={() => setAction(actionItem.id)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                        action === actionItem.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${actionItem.color}`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{actionItem.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{actionItem.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action Description */}
            {action && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{getActionDescription()}</p>
              </div>
            )}

            {/* Status Update Fields */}
            {action === 'update_status' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Update Fields */}
            {action === 'update_category' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Confirmation Message */}
            {action && action !== 'export' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{getConfirmationMessage()}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              
              {action === 'export' ? (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export Selected
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !action || (action === 'update_category' && !selectedCategory)}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Apply to ${selectedProductIds.length} Products`
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}