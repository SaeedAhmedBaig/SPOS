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
    const headers = Array.from(new Set(
      rows.flatMap(row => Object.keys(row))
    ))

    const csvContent = [
      headers.join(','), // Header row
      ...rows.map(row => 
        headers.map(h => {
          let value = row[h] ?? ''
          // Remove commas from string values to prevent CSV issues
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

  return (
    <button
      type="button"
      onClick={downloadCSV}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
    >
      <Download className="w-4 h-4 mr-2" />
      Export
    </button>
  )
}
