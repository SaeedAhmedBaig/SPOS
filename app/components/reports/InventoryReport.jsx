'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Select from '../ui/Select'
import Table from '../ui/Table'
import ExportReportButton from './ExportReportButton'
import { DollarSign, Package, AlertTriangle, AlertCircle } from 'lucide-react'

export default function InventoryReport() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    warehouse: ''
  })

  useEffect(() => {
    fetchInventoryReport()
  }, [filters])

  const fetchInventoryReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.warehouse && { warehouse: filters.warehouse })
      })

      const response = await fetch(`/api/reports/inventory?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
        setSummary(result.summary || {})
      }
    } catch (error) {
      console.error('Error fetching inventory report:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock, reorderLevel) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (stock <= reorderLevel) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: row => <div className="text-sm font-medium text-gray-900">{row.name}</div>
    },
    { key: 'sku', header: 'SKU' },
    { key: 'currentStock', header: 'Current Stock' },
    {
      key: 'status',
      header: 'Status',
      render: row => {
        const stockStatus = getStockStatus(row.currentStock, row.reorderLevel)
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.status}
          </span>
        )
      }
    },
    {
      key: 'costValue',
      header: 'Cost Value',
      render: row => `$${(row.cost * row.currentStock)?.toFixed(2)}`
    },
    {
      key: 'retailValue',
      header: 'Retail Value',
      render: row => `$${(row.price * row.currentStock)?.toFixed(2)}`
    },
    {
      key: 'category',
      header: 'Category',
      render: row => row.category?.name || 'Uncategorized'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Inventory Report</h2>
            <p className="text-gray-700">Current stock levels and inventory value</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Select
              value={filters.category}
              onChange={value => setFilters(prev => ({ ...prev, category: value }))}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'electronics', label: 'Electronics' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'furniture', label: 'Furniture' }
              ]}
              placeholder="Category"
            />
            <Select
              value={filters.status}
              onChange={value => setFilters(prev => ({ ...prev, status: value }))}
              options={[
                { value: '', label: 'All Status' },
                { value: 'in_stock', label: 'In Stock' },
                { value: 'low_stock', label: 'Low Stock' },
                { value: 'out_of_stock', label: 'Out of Stock' }
              ]}
              placeholder="Status"
            />
            <Select
              value={filters.warehouse}
              onChange={value => setFilters(prev => ({ ...prev, warehouse: value }))}
              options={[
                { value: '', label: 'All Warehouses' },
                { value: 'warehouse_1', label: 'Warehouse 1' },
                { value: 'warehouse_2', label: 'Warehouse 2' }
              ]}
              placeholder="Warehouse"
            />
            <ExportReportButton
              reportType="inventory"
              filters={filters}
              data={data}
              summary={summary}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">${summary.totalValue?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalProducts?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{summary.lowStockItems?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{summary.outOfStockItems?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Inventory Details</h3>
        </div>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No inventory data found"
        />
      </Card>
    </div>
  )
}
