'use client'

import { useState } from 'react'
import { X, Trash2, Edit3, Mail, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

const BULK_ACTIONS = [
  { id: 'delete', label: 'Delete Customers', icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-50' },
  { id: 'update_status', label: 'Update Status', icon: Edit3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'export', label: 'Export Selected', icon: Download, color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'send_email', label: 'Send Email', icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-50' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'premium', label: 'Premium' },
  { value: 'inactive', label: 'Inactive' },
]

export default function BulkActionsModal({ 
  isOpen, 
  onClose, 
  selectedCustomerIds = [], 
  onComplete 
}) {
  const [selectedAction, setSelectedAction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updateData, setUpdateData] = useState({
    status: 'active'
  })

  if (!isOpen) return null

  const handleActionSelect = (actionId) => {
    setSelectedAction(actionId)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedAction) {
      setError('Please select an action')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      let response

      switch (selectedAction) {
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedCustomerIds.length} customers? This action cannot be undone.`)) {
            setIsLoading(false)
            return
          }
          response = await fetch('/api/customers/bulk/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerIds: selectedCustomerIds
            })
          })
          break

        case 'update_status':
          response = await fetch('/api/customers/bulk/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerIds: selectedCustomerIds,
              updates: {
                status: updateData.status
              }
            })
          })
          break

        case 'export':
          response = await fetch('/api/customers/bulk/export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerIds: selectedCustomerIds
            })
          })

          if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `customers-bulk-export-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }
          break

        case 'send_email':
          response = await fetch('/api/customers/bulk/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerIds: selectedCustomerIds
            })
          })
          break

        default:
          throw new Error('Unknown action')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Action failed: ${response.status}`)
      }

      if (selectedAction !== 'export') {
        const result = await response.json()
        setSuccess(result.message || `Successfully ${getActionVerb(selectedAction)} ${selectedCustomerIds.length} customers`)
      } else {
        setSuccess(`Successfully exported ${selectedCustomerIds.length} customers`)
      }

      // Call onComplete after a short delay to show success message
      setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
      }, 1500)

    } catch (err) {
      console.error('Bulk action error:', err)
      setError(err.message || 'An error occurred while performing the bulk action')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionVerb = (action) => {
    switch (action) {
      case 'delete': return 'deleted'
      case 'update_status': return 'updated'
      case 'export': return 'exported'
      case 'send_email': return 'emailed'
      default: return 'processed'
    }
  }

  const handleClose = () => {
    setSelectedAction('')
    setError('')
    setSuccess('')
    setIsLoading(false)
    setUpdateData({ status: 'active' })
    onClose()
  }

  const getActionDescription = (actionId) => {
    switch (actionId) {
      case 'delete':
        return `Permanently delete ${selectedCustomerIds.length} selected customers. This action cannot be undone.`
      case 'update_status':
        return `Update the status for ${selectedCustomerIds.length} selected customers.`
      case 'export':
        return `Export ${selectedCustomerIds.length} selected customers to CSV format.`
      case 'send_email':
        return `Send marketing email to ${selectedCustomerIds.length} selected customers.`
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bulk Actions</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedCustomerIds.length} customers selected
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Selection */}
          {!success && (
            <>
              <div className="space-y-2 mb-6">
                {BULK_ACTIONS.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleActionSelect(action.id)}
                      disabled={isLoading}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedAction === action.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${action.bgColor}`}>
                          <IconComponent className={`w-4 h-4 ${action.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.label}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {getActionDescription(action.id)}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Action Configuration */}
              {selectedAction === 'update_status' && (
                <div className="border-t pt-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status To
                  </label>
                  <select
                    id="status"
                    value={updateData.status}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedAction === 'send_email' && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    This will send a marketing email to all selected customers. 
                    Make sure you have configured your email settings.
                  </p>
                </div>
              )}

              {selectedAction === 'export' && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    The exported CSV file will include all customer information including 
                    name, email, phone, address, and status.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !selectedAction}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedAction === 'delete' && <Trash2 className="w-4 h-4" />}
                  {selectedAction === 'update_status' && <Edit3 className="w-4 h-4" />}
                  {selectedAction === 'export' && <Download className="w-4 h-4" />}
                  {selectedAction === 'send_email' && <Mail className="w-4 h-4" />}
                  {!selectedAction ? 'Select Action' : `Execute ${getActionVerb(selectedAction)}`}
                </>
              )}
            </button>
          </div>
        )}

        {/* Success Footer */}
        {success && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleClose}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}