'use client'

import { useState, useEffect } from 'react'
import InventoryListTable from './InventoryListTable'
import LowStockList from './LowStockList'
import StockAdjustmentForm from './StockAdjustmentForm'
import StockTransferForm from './StockTransferForm'
import InventoryHistory from './InventoryHistory'
import BulkStockUpdate from './BulkStockUpdate'

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'all', name: 'All Inventory' },
    { id: 'low-stock', name: 'Low Stock' },
    { id: 'out-of-stock', name: 'Out of Stock' },
    { id: 'history', name: 'Stock History' }
  ]

  // Fetch warehouses on component mount
  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses')
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data)
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustStock = (product) => {
    setSelectedProduct(product)
    setShowAdjustmentForm(true)
  }

  const handleRefresh = () => {
    // This will trigger refresh in child components
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-700">Manage your product stock levels and adjustments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkUpdate(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Bulk Update
          </button>
          <button
            onClick={() => setShowTransferForm(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Transfer Stock
          </button>
          <button
            onClick={() => setShowAdjustmentForm(true)}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'all' && (
          <InventoryListTable 
            onAdjustStock={handleAdjustStock}
            warehouses={warehouses}
            onRefresh={handleRefresh}
          />
        )}
        
        {activeTab === 'low-stock' && (
          <LowStockList 
            onAdjustStock={handleAdjustStock}
            warehouses={warehouses}
          />
        )}
        
        {activeTab === 'out-of-stock' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-gray-900 text-lg font-medium">No out of stock products</div>
              <div className="text-gray-700 mt-1">All products are currently in stock</div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <InventoryHistory warehouses={warehouses} />
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustmentForm && (
        <StockAdjustmentForm
          product={selectedProduct}
          warehouses={warehouses}
          onClose={() => {
            setShowAdjustmentForm(false)
            setSelectedProduct(null)
          }}
          onSave={handleRefresh}
        />
      )}

      {/* Stock Transfer Modal */}
      {showTransferForm && (
        <StockTransferForm
          warehouses={warehouses}
          onClose={() => setShowTransferForm(false)}
          onSave={handleRefresh}
        />
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <BulkStockUpdate
          warehouses={warehouses}
          onClose={() => setShowBulkUpdate(false)}
          onSave={handleRefresh}
        />
      )}
    </div>
  )
}