'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Select from '../ui/Select'
import Table from '../ui/Table'
import ExportReportButton from './ExportReportButton'

export default function PurchaseReport() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    supplier: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchPurchaseReport()
  }, [filters])

  const fetchPurchaseReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filters.supplier && { supplier: filters.supplier }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/api/reports/purchases?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
        setSummary(result.summary || {})
      }
    } catch (error) {
      console.error('Error fetching purchase report:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', header: 'Purchase ID' },
    { key: 'supplier', header: 'Supplier', render: row => row.supplier?.name || 'Unknown' },
    { key: 'totalAmount', header: 'Total Amount', render: row => `$${row.totalAmount?.toFixed(2)}` },
    { key: 'status', header: 'Status', render: row => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {row.status}
      </span>
    )},
    { key: 'date', header: 'Date', render: row => new Date(row.date).toLocaleDateString() }
  ]

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Purchase Report</h2>
            <p className="text-gray-700">Overview of purchases and orders</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Select
              value={filters.supplier}
              onChange={value => setFilters(prev => ({ ...prev, supplier: value }))}
              options={[
                { value: '', label: 'All Suppliers' },
                { value: 'supplier_1', label: 'Supplier 1' },
                { value: 'supplier_2', label: 'Supplier 2' }
              ]}
              placeholder="Supplier"
            />
            <Select
              value={filters.status}
              onChange={value => setFilters(prev => ({ ...prev, status: value }))}
              options={[
                { value: '', label: 'All Status' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' }
              ]}
              placeholder="Status"
            />
            <ExportReportButton
              reportType="purchases"
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
          <p className="text-sm font-medium text-gray-700">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalPurchases?.toLocaleString() || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalOrders?.toLocaleString() || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Pending Orders</p>
          <p className="text-2xl font-bold text-gray-900">{summary.pendingOrders?.toLocaleString() || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Completed Orders</p>
          <p className="text-2xl font-bold text-gray-900">{summary.completedOrders?.toLocaleString() || '0'}</p>
        </Card>
      </div>

      {/* Purchase Table */}
      <Card>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No purchase data found"
        />
      </Card>
    </div>
  )
}
