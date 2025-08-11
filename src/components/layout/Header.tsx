'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  onMenuToggle?: () => void
  showMobileMenu?: boolean
}

export default function Header({ onMenuToggle, showMobileMenu }: HeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Side - Logo and Mobile Menu */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 mr-2"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            {/* Logo */}
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
              <h1 className="ml-2 lg:ml-3 text-lg lg:text-xl font-bold text-gray-900">
                PLS Travels DMS
              </h1>
            </div>
          </div>

          {/* Center - Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips, drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Right Side - Actions and User Menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search Button (Mobile) */}
            <button
              onClick={() => router.push('/search')}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => router.push('/audit')}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge would go here */}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden lg:block text-sm text-gray-700">
                  {user?.email}
                </span>
              </button>
              
              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        router.push('/settings')
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        handleSignOut()
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}