'use client'

import { useState } from 'react'

export default function ExportReportButton({ reportType, filters, data, summary }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async (format) => {
    try {
      setLoading(true)
      
      const payload = {
        reportType,
        filters,
        data,
        summary,
        format
      }

      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Failed to export report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        disabled={loading}
        onClick={() => handleExport('csv')}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </>
        )}
      </button>
    </div>
  )
}