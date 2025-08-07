"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Calendar,
  DollarSign,
  FileText,
  Bell,
  Search
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: number
  description?: string
}

export default function Navigation() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'Drivers',
      href: '/drivers',
      icon: Users,
      description: 'Manage driver profiles'
    },
    {
      name: 'Trips',
      href: '/trips',
      icon: MapPin,
      description: 'Track and manage trips'
    },
    {
      name: 'Audit',
      href: '/audit',
      icon: AlertTriangle,
      badge: notifications,
      description: 'Review anomalies'
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      description: 'Track driver attendance'
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: DollarSign,
      description: 'Manage payments'
    }
  ]

  useEffect(() => {
    // Fetch notification count
    const fetchNotifications = async () => {
      try {
        const { count } = await supabase
          .from('trips')
          .select('*', { count: 'exact', head: true })
          .eq('audit_status', 'needs_review')
        
        setNotifications(count || 0)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    if (user) {
      fetchNotifications()
    }
  }, [user])

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

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="ml-2 text-lg font-bold text-gray-900">
                PLS Travels
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button
                onClick={() => router.push('/search')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Search className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              {notifications > 0 && (
                <button
                  onClick={() => router.push('/audit')}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                </button>
              )}
              
              {/* Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          router.push(item.href)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t">
                  <button
                    onClick={() => {
                      router.push('/settings')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  PLS Travels DMS
                </h1>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-8">
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

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                {notifications > 0 && (
                  <button
                    onClick={() => router.push('/audit')}
                    className="relative p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  </button>
                )}

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{user?.email}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <button
                        onClick={() => router.push('/settings')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <div className="flex">
          <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-gray-50">
            {/* Content will be rendered here */}
          </main>
        </div>
      </div>
    </>
  )
}
