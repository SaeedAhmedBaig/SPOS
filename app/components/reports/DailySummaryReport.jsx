'use client'

import { useState, useEffect } from 'react'
import ExportReportButton from './ExportReportButton'
import Card from '../ui/Card'
import Input from '../ui/Input'

export default function DailySummaryReport() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchDailySummary()
  }, [filters])

  const fetchDailySummary = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        date: filters.date
      })

      const response = await fetch(`/api/reports/daily-summary?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daily Summary Report</h2>
            <p className="text-gray-700">Overview of daily business performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ date: e.target.value })}
              />
            </div>
            <ExportReportButton 
              reportType="daily-summary"
              filters={filters}
              data={data}
            />
          </div>
        </div>
      </Card>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Sales</span>
              <span className="font-medium text-gray-900">${data.totalSales?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Transactions</span>
              <span className="font-medium text-gray-900">{data.totalTransactions || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Average Ticket</span>
              <span className="font-medium text-gray-900">${data.averageTicket?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </Card>

        {/* Payments Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Cash</span>
              <span className="font-medium text-gray-900">${data.cashSales?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Card</span>
              <span className="font-medium text-gray-900">${data.cardSales?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Digital</span>
              <span className="font-medium text-gray-900">${data.digitalSales?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </Card>

        {/* Products Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Items Sold</span>
              <span className="font-medium text-gray-900">{data.itemsSold || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Categories</span>
              <span className="font-medium text-gray-900">{data.categoriesSold || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Returns</span>
              <span className="font-medium text-gray-900">{data.returns || '0'}</span>
            </div>
          </div>
        </Card>

        {/* Customer Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">New Customers</span>
              <span className="font-medium text-gray-900">{data.newCustomers || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Returning</span>
              <span className="font-medium text-gray-900">{data.returningCustomers || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Walk-ins</span>
              <span className="font-medium text-gray-900">{data.walkInCustomers || '0'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Hourly Breakdown */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Hourly Sales Breakdown</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))}
            </div>
          ) : data.hourlyBreakdown?.length > 0 ? (
            <div className="space-y-3">
              {data.hourlyBreakdown.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 w-20">{hour.hour}:00</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(hour.sales / (data.totalSales || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16">${hour.sales?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-900 font-medium">No sales data for selected date</div>
              <div className="text-gray-700 text-sm">Try selecting a different date</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}