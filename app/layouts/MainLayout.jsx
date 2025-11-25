'use client'

import { useState } from 'react'
import Sidebar from '../components/navigation/Sidebar'
import TopNavbar from '../components/navigation/TopNavbar'
import MobileMenu from '../components/navigation/MobileMenu'
import Footer from '../components/navigation/Footer'

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={`
        hidden lg:flex lg:flex-col lg:inset-y-0 lg:z-30
        transform transition-all duration-200 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Menu - Only for mobile screens */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <TopNavbar 
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        {/* Main Content with Footer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="p-6">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}