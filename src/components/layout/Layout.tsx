'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { ToastContainer } from '@/components/ui/Toast'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu={sidebarOpen}
        />
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          
          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
        
        {/* Toast Container */}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}