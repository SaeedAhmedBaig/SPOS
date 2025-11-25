'use client'

import { useState } from 'react'
import WarehouseSelect from './WarehouseSelect'

export default function BulkStockUpdate({ warehouses, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    updateType: 'set',
    warehouseId: warehouses[0]?.id || '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [products, setProducts] = useState([
    { id: '', quantity: '' }
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        adjustments: products
          .filter(p => p.id && p.quantity !== '')
          .map(p => ({
            productId: p.id,
            quantity: parseInt(p.quantity)
          }))
      }

      const response = await fetch('/api/inventory/bulk-adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        throw new Error('Failed to update stock')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    }
    setProducts(updatedProducts)
  }

  const addProductRow = () => {
    setProducts([...products, { id: '', quantity: '' }])
  }

  const removeProductRow = (index) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index)
      setProducts(updatedProducts)
    }
  }

  const updateTypes = [
    { value: 'set', label: 'Set to exact quantity' },
    { value: 'increase', label: 'Increase by quantity' },
    { value: 'decrease', label: 'Decrease by quantity' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Bulk Stock Update
          </h2>
          <p className="text-gray-700 text-sm mt-1">
            Update multiple products at once
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Update Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Warehouse
              </label>
              <WarehouseSelect
                value={formData.warehouseId}
                onChange={(e) => handleChange('warehouseId', e.target.value)}
                warehouses={warehouses}
              />
            </div>

            {/* Update Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Update Type
              </label>
              <select
                value={formData.updateType}
                onChange={(e) => handleChange('updateType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                required
              >
                {updateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-900">
                Products
              </label>
              <button
                type="button"
                onClick={addProductRow}
                className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Add Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Product ID/SKU
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={product.id}
                          onChange={(e) => handleProductChange(index, 'id', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700"
                          placeholder="Enter product ID or SKU"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-700"
                          placeholder="Enter quantity"
                          min="0"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProductRow(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Reason for Bulk Update
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
              required
            >
              <option value="">Select a reason</option>
              <option value="stock_take">Stock Take</option>
              <option value="new_delivery">New Delivery</option>
              <option value="year_end">Year End Adjustment</option>
              <option value="system_correction">System Correction</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
            <div className="text-sm text-gray-700">
              <p>• {products.filter(p => p.id && p.quantity !== '').length} products will be updated</p>
              <p>• Update type: {updateTypes.find(t => t.value === formData.updateType)?.label}</p>
              <p>• Warehouse: {warehouses.find(w => w.id === formData.warehouseId)?.name}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || products.filter(p => p.id && p.quantity !== '').length === 0}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update All Stock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}