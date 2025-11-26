'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Select from '../ui/Select'
import Table from '../ui/Table'
import ExportReportButton from './ExportReportButton'

export default function SupplierReport() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  })

  useEffect(() => {
    fetchSupplierReport()
  }, [filters])

  const fetchSupplierReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status })
      })

      const response = await fetch(`/api/reports/suppliers?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
        setSummary(result.summary || {})
      }
    } catch (error) {
      console.error('Error fetching supplier report:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Supplier Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', render: row => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {row.status}
      </span>
    )},
    { key: 'totalPurchases', header: 'Total Purchases', render: row => `$${row.totalPurchases?.toLocaleString() || '0'}` }
  ]

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Supplier Report</h2>
            <p className="text-gray-700">Overview of suppliers and their activity</p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Select
              value={filters.type}
              onChange={value => setFilters(prev => ({ ...prev, type: value }))}
              options={[
                { value: '', label: 'All Types' },
                { value: 'local', label: 'Local' },
                { value: 'international', label: 'International' }
              ]}
              placeholder="Supplier Type"
            />
            <Select
              value={filters.status}
              onChange={value => setFilters(prev => ({ ...prev, status: value }))}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              placeholder="Status"
            />
            <ExportReportButton
              reportType="suppliers"
              filters={filters}
              data={data}
              summary={summary}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm font-medium text-gray-700">Total Suppliers</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalSuppliers?.toLocaleString() || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Active Suppliers</p>
          <p className="text-2xl font-bold text-gray-900">{summary.activeSuppliers?.toLocaleString() || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Inactive Suppliers</p>
          <p className="text-2xl font-bold text-gray-900">{summary.inactiveSuppliers?.toLocaleString() || '0'}</p>
        </Card>
      </div>

      {/* Supplier Table */}
      <Card>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No supplier data found"
        />
      </Card>
    </div>
  )
}
