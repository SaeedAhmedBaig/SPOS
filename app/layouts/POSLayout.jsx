'use client'

import { useState } from 'react'
import { ArrowLeft, User, Settings } from 'lucide-react'

export default function POSLayout({ children }) {
  const [cashier] = useState('John Doe')

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Minimal POS Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button and Logo */}
          <div className="flex items-center gap-4">
            <a 
              href="/"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">QPOS</h1>
                <p className="text-gray-500 text-sm">Point of Sale</p>
              </div>
            </div>
          </div>

          {/* Right Section - User Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{cashier}</p>
                <p className="text-xs text-gray-500">Cashier</p>
              </div>
            </div>
            
            <button 
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* POS Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {children}
      </div>
    </div>
  )
}