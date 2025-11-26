'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Table from '../ui/Table'
import Select from '../ui/Select'
import DateRangePicker from '../ui/DateRangePicker'
import ExportReportButton from './ExportReportButton'

export default function SalesReport() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    startDate: '',
    endDate: '',
    status: 'all',
    page: 1,
  })

  const dateRanges = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  useEffect(() => {
    fetchSalesReport()
  }, [filters])

  const fetchSalesReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page,
        limit: 20,
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
      })

      const response = await fetch(`/api/reports/sales?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
        setSummary(result.summary || {})
      }
    } catch (error) {
      console.error('Error fetching sales report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : prev.page,
    }))
  }

  const handleDateRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range.type,
      startDate: range.startDate,
      endDate: range.endDate,
      page: 1,
    }))
  }

  const columns = [
    { key: 'orderId', header: 'Order ID' },
    { key: 'customer', header: 'Customer' },
    { key: 'date', header: 'Date', render: row => new Date(row.date).toLocaleDateString() },
    { key: 'status', header: 'Status', render: row => row.status },
    { key: 'total', header: 'Total', render: row => `$${row.total?.toLocaleString()}` },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Date Range</label>
            <Select
              value={filters.dateRange}
              onChange={value => handleFilterChange('dateRange', value)}
              options={dateRanges}
            />
          </div>

          {filters.dateRange === 'custom' && (
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={handleDateRangeChange}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
            <Select
              value={filters.status}
              onChange={value => handleFilterChange('status', value)}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {data.length} orders
          </div>
          <ExportReportButton
            reportType="sales"
            filters={filters}
            data={data}
            summary={summary}
          />
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-sm font-medium text-gray-700">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">${summary.totalSales?.toLocaleString() || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalOrders || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Average Order</p>
          <p className="text-2xl font-bold text-gray-900">${summary.averageOrder?.toLocaleString() || '0'}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-700">Pending Orders</p>
          <p className="text-2xl font-bold text-gray-900">{summary.pendingOrders || '0'}</p>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sales Details</h3>
        </div>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No sales data found"
        />
      </Card>
    </div>
  )
}
