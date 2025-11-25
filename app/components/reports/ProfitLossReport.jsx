'use client'

import { useState, useEffect } from 'react'
import ExportReportButton from './ExportReportButton'

export default function ProfitLossReport() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    period: 'this_month',
    startDate: '',
    endDate: '',
    compareWithPrevious: false
  })

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Period' }
  ]

  useEffect(() => {
    fetchProfitLossReport()
  }, [filters])

  const fetchProfitLossReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filters.period && { period: filters.period }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.compareWithPrevious && { compare: 'true' })
      })

      const response = await fetch(`/api/reports/profit-loss?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching profit & loss report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getChangeIcon = (change) => {
    if (change > 0) return '↗'
    if (change < 0) return '↘'
    return '→'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profit & Loss Statement</h2>
            <p className="text-gray-700">Financial performance overview</p>
          </div>
          <ExportReportButton 
            reportType="profit-loss"
            filters={filters}
            data={data}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Period Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Period</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Inputs */}
          {filters.period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                />
              </div>
            </>
          )}

          {/* Comparison Toggle */}
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.compareWithPrevious}
                onChange={(e) => handleFilterChange('compareWithPrevious', e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-sm text-gray-900">Compare with previous period</span>
            </label>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Gross Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.grossProfit)}</p>
              {data.grossProfitChange && (
                <p className={`text-sm ${getChangeColor(data.grossProfitChange)}`}>
                  {getChangeIcon(data.grossProfitChange)} {Math.abs(data.grossProfitChange).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.netProfit)}</p>
              {data.netProfitChange && (
                <p className={`text-sm ${getChangeColor(data.netProfitChange)}`}>
                  {getChangeIcon(data.netProfitChange)} {Math.abs(data.netProfitChange).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{data.profitMargin?.toFixed(1) || '0'}%</p>
              {data.profitMarginChange && (
                <p className={`text-sm ${getChangeColor(data.profitMarginChange)}`}>
                  {getChangeIcon(data.profitMarginChange)} {Math.abs(data.profitMarginChange).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Profit & Loss Statement</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              ))}
            </div>
          ) : data.statement ? (
            <div className="space-y-4">
              {/* Revenue */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="font-medium text-gray-900">Revenue</div>
                  <div className="font-medium text-gray-900">{formatCurrency(data.statement.revenue)}</div>
                </div>
                
                <div className="flex justify-between items-center pl-4 text-sm">
                  <div className="text-gray-700">Product Sales</div>
                  <div className="text-gray-900">{formatCurrency(data.statement.productSales)}</div>
                </div>
                
                <div className="flex justify-between items-center pl-4 text-sm">
                  <div className="text-gray-700">Service Revenue</div>
                  <div className="text-gray-900">{formatCurrency(data.statement.serviceRevenue)}</div>
                </div>
              </div>

              {/* Cost of Goods Sold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="font-medium text-gray-900">Cost of Goods Sold</div>
                  <div className="font-medium text-gray-900">{formatCurrency(data.statement.cogs)}</div>
                </div>
                
                <div className="flex justify-between items-center pl-4 text-sm">
                  <div className="text-gray-700">Inventory Costs</div>
                  <div className="text-gray-900">{formatCurrency(data.statement.inventoryCosts)}</div>
                </div>
                
                <div className="flex justify-between items-center pl-4 text-sm">
                  <div className="text-gray-700">Direct Labor</div>
                  <div className="text-gray-900">{formatCurrency(data.statement.directLabor)}</div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between items-center py-2 border-t border-b font-medium text-gray-900">
                <div>Gross Profit</div>
                <div>{formatCurrency(data.statement.grossProfit)}</div>
              </div>

              {/* Operating Expenses */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="font-medium text-gray-900">Operating Expenses</div>
                  <div className="font-medium text-gray-900">{formatCurrency(data.statement.operatingExpenses)}</div>
                </div>
                
                <div className="flex justify-between items-center pl-4 text-sm">
                  <div className="text-gray-700">Salaries & Wages</div>
                  <div className="text-gray-900">{formatCurrency(data.statement.salaries)}</div>
                </div>
                
                <div className="flex justify-between items-center pl-4 text-sm">
                  <div className="text-gray-700">Rent & Utilities</div>
                  <div className="text-gray-900">{formatCurrency(data.statement.rent)}</div>
                </div>
                
                <div className="flex justify-between items-center pl-4 text-sm">
                  <div className="text-gray-700">Marketing</div>
                  <div className="text-gray-900">{formatCurrency(data.statement.marketing)}</div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex justify-between items-center py-2 border-t font-bold text-lg text-gray-900">
                <div>Net Profit</div>
                <div>{formatCurrency(data.statement.netProfit)}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-900 font-medium">No financial data available</div>
              <div className="text-gray-700 text-sm">Try selecting a different period</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}