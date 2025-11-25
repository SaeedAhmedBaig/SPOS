'use client'

import { useState, useEffect } from 'react'
import ExportReportButton from './ExportReportButton'
import Card from '../ui/Card'
import Table from '../ui/Table'
import Select from '../ui/Select'
import Input from '../ui/Input'
import DateRangePicker from '../ui/DateRangePicker' // fixed: default import

export default function CustomerReport() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    startDate: '',
    endDate: '',
    customerType: '',
    page: 1
  })

  const dateRanges = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Date Range' }
  ]

  const customerTypes = [
    { value: '', label: 'All Types' },
    { value: 'regular', label: 'Regular' },
    { value: 'premium', label: 'Premium' },
    { value: 'new', label: 'New Customers' },
    { value: 'returning', label: 'Returning' }
  ]

  useEffect(() => {
    fetchCustomerReport()
  }, [filters])

  const fetchCustomerReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page,
        limit: 20,
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.customerType && { customerType: filters.customerType })
      })

      const response = await fetch(`/api/reports/customers?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
        setSummary(result.summary || {})
      }
    } catch (error) {
      console.error('Error fetching customer report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : prev.page
    }))
  }

  const handleDateRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range.type,
      startDate: range.startDate,
      endDate: range.endDate,
      page: 1
    }))
  }

  const getCustomerTypeColor = (type) => {
    const colors = {
      premium: 'bg-purple-100 text-purple-800',
      regular: 'bg-blue-100 text-blue-800',
      new: 'bg-green-100 text-green-800',
      returning: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const columns = [
    { 
      key: 'customer', 
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-700">{row.email}</div>
          <div className="text-sm text-gray-600">{row.phone}</div>
        </div>
      )
    },
    { 
      key: 'type', 
      header: 'Type',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerTypeColor(row.type)}`}>
          {row.type || 'regular'}
        </span>
      )
    },
    { key: 'totalOrders', header: 'Total Orders' },
    { key: 'totalSpent', header: 'Total Spent', render: (row) => `$${row.totalSpent?.toLocaleString()}` },
    { key: 'averageOrderValue', header: 'Avg. Order', render: (row) => `$${row.averageOrderValue?.toLocaleString()}` },
    { key: 'lastOrderDate', header: 'Last Order', render: (row) => row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleDateString() : 'Never' },
    { key: 'status', header: 'Status', render: (row) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {row.status || 'active'}
      </span>
    )}
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
              onChange={(value) => handleFilterChange('dateRange', value)}
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
            <label className="block text-sm font-medium text-gray-900 mb-1">Customer Type</label>
            <Select
              value={filters.customerType}
              onChange={(value) => handleFilterChange('customerType', value)}
              options={customerTypes}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {data.length} customers
          </div>
          <ExportReportButton 
            reportType="customers"
            filters={filters}
            data={data}
            summary={summary}
          />
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Customers Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalCustomers?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              {/* SVG icon */}
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Active customers in period</p>
        </Card>
        {/* New Customers, Avg. Order Value, Repeat Rate Cards (same structure as above) */}
      </div>

      {/* Customers Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
        </div>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No customer data found. Try adjusting your filters."
        />
      </Card>
    </div>
  )
}
