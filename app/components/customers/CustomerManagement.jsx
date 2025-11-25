'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, AlertCircle, RefreshCw } from 'lucide-react'
import CustomerTable from './CustomerTable'
import CustomerFilters from './CustomerFilters'
import CustomerModal from './CustomerModal'
import BulkActionsModal from './BulkActionsModal'

export default function CustomerManagement() {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCustomers, setSelectedCustomers] = useState(new Set())
  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  })

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      })

      const response = await fetch(`/api/customers?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`)
      }
      
      const data = await response.json()
      setCustomers(data.customers || [])
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.totalPages || 1
      }))
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError(err.message)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedStatus, pagination.page, pagination.limit])

  // Load customers on component mount and when filters change
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    setSelectedCustomers(new Set())
  }, [searchTerm, selectedStatus])

  // Customer actions
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleAddCustomer = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
    // Refresh customers after modal closes (in case of updates)
    fetchCustomers()
  }

  const handleSaveCustomer = async (customerData, customerId = null) => {
    try {
      const url = customerId ? `/api/customers/${customerId}` : '/api/customers'
      const method = customerId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to save customer: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error saving customer:', error)
      throw error
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete customer: ${response.status}`)
      }

      // Refresh the customer list
      await fetchCustomers()
    } catch (err) {
      console.error('Error deleting customer:', err)
      setError(err.message)
    }
  }

  // Bulk actions
  const handleBulkAction = () => {
    if (selectedCustomers.size === 0) {
      setError('Please select customers to perform bulk actions')
      return
    }
    setIsBulkModalOpen(true)
  }

  const handleBulkActionComplete = () => {
    setIsBulkModalOpen(false)
    setSelectedCustomers(new Set())
    fetchCustomers()
  }

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(customerId)) {
        newSelection.delete(customerId)
      } else {
        newSelection.add(customerId)
      }
      return newSelection
    })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = customers.map(customer => customer.id)
      setSelectedCustomers(new Set(allIds))
    } else {
      setSelectedCustomers(new Set())
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

        const response = await fetch('/api/customers/import', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Import failed')
        }

        // Refresh customer list
        await fetchCustomers()
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

      const response = await fetch(`/api/customers/export?${params}`)
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`
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
    setSelectedCustomers(new Set())
  }

  // Error handling
  const handleRetry = () => {
    setError(null)
    fetchCustomers()
  }

  const getFilteredCount = () => {
    if (searchTerm || selectedStatus !== 'all') {
      return customers.length
    }
    return pagination.total
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-gray-700" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
              <p className="text-gray-600 mt-1">Manage your customer database and profiles</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Refresh Button */}
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh customers"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bulk Actions Button */}
          {selectedCustomers.size > 0 && (
            <button
              onClick={handleBulkAction}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>Bulk Actions ({selectedCustomers.size})</span>
            </button>
          )}

          {/* Add Customer Button */}
          <button
            onClick={handleAddCustomer}
            className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Customer
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
      <CustomerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onImport={handleImport}
        onExport={handleExport}
        importLoading={importLoading}
        exportLoading={exportLoading}
        loading={loading}
        totalCustomers={pagination.total}
        filteredCount={getFilteredCount()}
      />

      {/* Customers Table */}
      <CustomerTable
        customers={customers}
        loading={loading}
        selectedCustomers={selectedCustomers}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onSelectCustomer={handleSelectCustomer}
        onSelectAll={handleSelectAll}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedCustomerIds={Array.from(selectedCustomers)}
        onComplete={handleBulkActionComplete}
      />
    </div>
  )
}