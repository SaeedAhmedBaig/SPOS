'use client'

import { Download } from 'lucide-react'

export default function ExportReportButton({ reportType, filters = {}, data = [], summary = {} }) {
  
  const downloadCSV = () => {
    if (!data.length && !Object.keys(summary).length) return

    // Combine data and summary for CSV
    const rows = [...data]

    // Optionally add summary as first row
    if (Object.keys(summary).length) {
      rows.unshift({ ...summary, _isSummary: true })
    }

    // Extract headers dynamically
    const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row))))

    const csvContent = [
      headers.join(','), // Header row
      ...rows.map(row => 
        headers.map(h => {
          let value = row[h] ?? ''
          if (typeof value === 'string') value = value.replace(/,/g, ' ')
          return `"${value}"`
        }).join(',')
      )
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isDisabled = !data.length && !Object.keys(summary).length

  return (
    <button
      type="button"
      onClick={downloadCSV}
      disabled={isDisabled}
      className={`
        inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg 
        transition-all duration-200
        ${isDisabled 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
          : 'bg-black text-white hover:bg-gray-900 shadow-sm'}
      `}
    >
      <Download className="w-4 h-4 mr-2" />
      Export
    </button>
  )
}
