'use client'

import React, { useState, useEffect } from 'react'
import Card from '../ui/Card'
import ExportReportButton from './ExportReportButton'
import { DollarSign, BarChart2, TrendingUp } from 'lucide-react'

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
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = amount =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)

  const getChangeColor = change => (change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600')
  const getChangeIcon = change => (change > 0 ? '↗' : change < 0 ? '↘' : '→')

  // Icon mapping for metrics
  const metricIcons = {
    grossprofit: <DollarSign className="w-6 h-6 text-green-600" />,
    netprofit: <BarChart2 className="w-6 h-6 text-blue-600" />,
    profitmargin: <TrendingUp className="w-6 h-6 text-purple-600" />
  }

  const iconBackgrounds = {
    grossprofit: 'bg-green-100',
    netprofit: 'bg-blue-100',
    profitmargin: 'bg-purple-100'
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profit & Loss Statement</h2>
            <p className="text-gray-700">Financial performance overview</p>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Period</label>
              <select
                value={filters.period}
                onChange={e => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            {filters.period === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={e => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={e => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.compareWithPrevious}
                  onChange={e => handleFilterChange('compareWithPrevious', e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-900">Compare with previous period</span>
              </label>
            </div>

            <ExportReportButton reportType="profit-loss" filters={filters} data={data} />
          </div>
        </div>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Gross Profit', 'Net Profit', 'Profit Margin'].map((metric, idx) => {
          const key = metric.replace(/\s/g, '').toLowerCase()
          const changeKey = `${key}Change`
          return (
            <Card key={idx}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{metric}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric === 'Profit Margin'
                      ? `${data[key]?.toFixed(1) || '0'}%`
                      : formatCurrency(data[key])}
                  </p>
                  {data[changeKey] && (
                    <p className={`text-sm ${getChangeColor(data[changeKey])}`}>
                      {getChangeIcon(data[changeKey])} {Math.abs(data[changeKey]).toFixed(1)}%
                    </p>
                  )}
                </div>
                <div className={`p-3 ${iconBackgrounds[key]} rounded-lg`}>
                  {metricIcons[key]}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* P&L Statement Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Profit & Loss Statement</h3>
        </div>
        <div className="p-6 space-y-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex justify-between items-center py-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            ))
          ) : data.statement ? (
            <>
              {Object.entries(data.statement).map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b">
                  <div className="text-gray-900 font-medium">{label.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-gray-900 font-medium">
                    {typeof value === 'number' ? formatCurrency(value) : value}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 border-t text-gray-900 font-bold text-lg">
                <div>Net Profit</div>
                <div>{formatCurrency(data.statement.netProfit)}</div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-700">
              No financial data available. Try selecting a different period.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
