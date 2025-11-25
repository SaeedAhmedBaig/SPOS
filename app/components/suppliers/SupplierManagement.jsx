'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Building, AlertCircle, RefreshCw } from 'lucide-react'
import SupplierTable from './SupplierTable'
import SupplierFilters from './SupplierFilters'
import SupplierModal from './SupplierModal'
import BulkActionsModal from './BulkActionsModal'

export default function SupplierManagement() {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSuppliers, setSelectedSuppliers] = useState(new Set())
  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })

  // Fetch suppliers from API
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      })

      const response = await fetch(`/api/suppliers?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.status}`)
      }
      
      const data = await response.json()
      setSuppliers(data.suppliers || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1
      }))
    } catch (err) {
      console.error('Error fetching suppliers:', err)
      setError(err.message)
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedStatus, pagination.page, pagination.limit])

  // Load suppliers on component mount and when filters change
  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    setSelectedSuppliers(new Set())
  }, [searchTerm, selectedStatus])

  // Supplier actions
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleAddSupplier = () => {
    setEditingSupplier(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSupplier(null)
    // Refresh suppliers after modal closes (in case of updates)
    fetchSuppliers()
  }

  const handleSaveSupplier = async (supplierData, supplierId = null) => {
    try {
      const url = supplierId ? `/api/suppliers/${supplierId}` : '/api/suppliers'
      const method = supplierId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to save supplier: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error saving supplier:', error)
      throw error
    }
  }

  const handleDeleteSupplier = async (supplierId) => {
    if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete supplier: ${response.status}`)
      }

      // Refresh the supplier list
      await fetchSuppliers()
    } catch (err) {
      console.error('Error deleting supplier:', err)
      setError(err.message)
    }
  }

  // Bulk actions
  const handleBulkAction = () => {
    if (selectedSuppliers.size === 0) {
      setError('Please select suppliers to perform bulk actions')
      return
    }
    setIsBulkModalOpen(true)
  }

  const handleBulkActionComplete = () => {
    setIsBulkModalOpen(false)
    setSelectedSuppliers(new Set())
    fetchSuppliers()
  }

  const handleSelectSupplier = (supplierId) => {
    setSelectedSuppliers(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(supplierId)) {
        newSelection.delete(supplierId)
      } else {
        newSelection.add(supplierId)
      }
      return newSelection
    })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = suppliers.map(supplier => supplier.id)
      setSelectedSuppliers(new Set(allIds))
    } else {
      setSelectedSuppliers(new Set())
    }
  }

  // Import/Export handlers
  const handleImport = async () => {
    setImportLoading(true)
    try {
      // Create file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.csv,.xlsx,.xls'
      input.onchange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/suppliers/import', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Import failed')
        }

        // Refresh supplier list
        await fetchSuppliers()
        setImportLoading(false)
      }
      input.click()
    } catch (err) {
      console.error('Import error:', err)
      setError(err.message)
      setImportLoading(false)
    }
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      })

      const response = await fetch(`/api/suppliers/export?${params}`)
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `suppliers-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message)
    } finally {
      setExportLoading(false)
    }
  }

  // Pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    setSelectedSuppliers(new Set())
  }

  // Error handling
  const handleRetry = () => {
    setError(null)
    fetchSuppliers()
  }

  const getFilteredCount = () => {
    if (searchTerm || selectedStatus !== 'all') {
      return suppliers.length
    }
    return pagination.total
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-gray-700" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
              <p className="text-gray-600 mt-1">Manage your supplier database and procurement relationships</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Refresh Button */}
          <button
            onClick={fetchSuppliers}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh suppliers"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bulk Actions Button */}
          {selectedSuppliers.size > 0 && (
            <button
              onClick={handleBulkAction}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>Bulk Actions ({selectedSuppliers.size})</span>
            </button>
          )}

          {/* Add Supplier Button */}
          <button
            onClick={handleAddSupplier}
            className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
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
      <SupplierFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onImport={handleImport}
        onExport={handleExport}
        importLoading={importLoading}
        exportLoading={exportLoading}
        loading={loading}
        totalSuppliers={pagination.total}
        filteredCount={getFilteredCount()}
      />

      {/* Suppliers Table */}
      <SupplierTable
        suppliers={suppliers}
        loading={loading}
        selectedSuppliers={selectedSuppliers}
        onEditSupplier={handleEditSupplier}
        onDeleteSupplier={handleDeleteSupplier}
        onSelectSupplier={handleSelectSupplier}
        onSelectAll={handleSelectAll}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        supplier={editingSupplier}
        onSave={handleSaveSupplier}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedSupplierIds={Array.from(selectedSuppliers)}
        onComplete={handleBulkActionComplete}
      />
    </div>
  )
}