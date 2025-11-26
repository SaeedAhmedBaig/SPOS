'use client'

import { useState, useEffect } from 'react'
import { UserCheck, ShoppingCart, Clock, CheckCircle2 } from 'lucide-react'
import ExportReportButton from './ExportReportButton'

export default function SupplierReport() {
  const [data, setData] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    startDate: '',
    endDate: '',
    status: '',
    page: 1
  })

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 transition"

  useEffect(() => {
    fetchSupplierReport()
  }, [filters])

  const fetchSupplierReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page,
        limit: 20,
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : prev.page
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Supplier Report</h2>
          <p className="text-gray-700">Supplier performance and purchase analytics</p>
        </div>
        <ExportReportButton 
          reportType="suppliers"
          filters={filters}
          data={data}
          summary={summary}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Active Suppliers", value: summary.activeSuppliers, icon: <UserCheck className="w-6 h-6 text-green-600" />, iconBg: "bg-green-100" },
          { title: "Total Purchases", value: summary.totalPurchases, icon: <ShoppingCart className="w-6 h-6 text-blue-600" />, iconBg: "bg-blue-100", prefix: '$' },
          { title: "Avg. Delivery Time", value: summary.avgDeliveryDays, icon: <Clock className="w-6 h-6 text-purple-600" />, iconBg: "bg-purple-100", suffix: ' days' },
          { title: "On-Time Rate", value: summary.onTimeRate?.toFixed(1), icon: <CheckCircle2 className="w-6 h-6 text-orange-600" />, iconBg: "bg-orange-100", suffix: '%' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.prefix || ''}{card.value?.toLocaleString() || '0'}{card.suffix || ''}
                </p>
              </div>
              <div className={`p-3 ${card.iconBg} rounded-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg border border-gray-200 min-h-[24rem]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Supplier Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Supplier", "Contact", "Total Orders", "Total Amount", "Avg. Delivery", "On-Time Rate", "Status"].map((col, idx) => (
                  <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <td key={idx} className="px-6 py-4 whitespace-nowrap">
                        <div className={idx === 6 ? "h-6 bg-gray-200 rounded-full animate-pulse" : "h-4 bg-gray-200 rounded animate-pulse"}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-sm text-gray-700">{supplier.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
                      <div className="text-sm text-gray-700">{supplier.phone}</div>
                      <div className="text-sm text-gray-600">{supplier.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${supplier.totalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.avgDeliveryDays} days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">{supplier.onTimeRate}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              supplier.onTimeRate >= 90 ? 'bg-green-600' :
                              supplier.onTimeRate >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${supplier.onTimeRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                        supplier.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {supplier.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-900 text-lg font-medium">No supplier data found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
