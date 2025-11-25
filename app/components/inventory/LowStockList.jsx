'use client'

import { useState, useEffect } from 'react'
import WarehouseSelect from './WarehouseSelect'

export default function LowStockList({ onAdjustStock, warehouses }) {
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWarehouse, setSelectedWarehouse] = useState('')

  useEffect(() => {
    fetchLowStockItems()
  }, [selectedWarehouse])

  const fetchLowStockItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: 'low_stock',
        ...(selectedWarehouse && { warehouse: selectedWarehouse })
      })

      const response = await fetch(`/api/inventory?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLowStockItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (stock, reorderLevel) => {
    const percentage = (stock / reorderLevel) * 100
    if (percentage <= 25) return 'bg-red-50 border-red-200'
    if (percentage <= 50) return 'bg-orange-50 border-orange-200'
    return 'bg-yellow-50 border-yellow-200'
  }

  return (
    <div className="space-y-4">
      {/* Warehouse Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
        <div className="w-48">
          <WarehouseSelect
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            warehouses={warehouses}
            includeAll={true}
          />
        </div>
      </div>

      {loading ? (
        // Loading skeleton
        Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-gray-200 rounded"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="space-y-2 text-right">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))
      ) : lowStockItems.length > 0 ? (
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-4 border rounded-lg ${getUrgencyColor(item.currentStock, item.reorderLevel)}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  (item.currentStock / item.reorderLevel) <= 0.25 ? 'bg-red-500' :
                  (item.currentStock / item.reorderLevel) <= 0.5 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-700">{item.sku} • {item.category?.name} • {item.warehouse?.name}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {item.currentStock} in stock
                  </div>
                  <div className="text-xs text-gray-700">
                    Reorder level: {item.reorderLevel}
                  </div>
                </div>
                <button
                  onClick={() => onAdjustStock(item)}
                  className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Restock
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-900 text-lg font-medium">No low stock items</div>
          <div className="text-gray-700 mt-1">All products are sufficiently stocked</div>
        </div>
      )}
    </div>
  )
}