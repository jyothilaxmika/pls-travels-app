"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plane, LogOut, Plus, X, Menu } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import TripTable from "@/components/trip/TripTable"
import TripForm from "@/components/forms/TripForm"

export default function TripsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b lg:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <Plane className="h-6 w-6 text-blue-600" />
            <h1 className="ml-2 text-lg font-bold text-gray-900">
              PLS Travels
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/audit')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Review Anomalies
              </button>
              <button
                onClick={() => router.push('/drivers')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Manage Drivers
              </button>
              <div className="border-t pt-2">
                <span className="block px-3 py-1 text-sm text-gray-500">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                PLS Travels DMS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </button>
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {showAddForm ? (
          <div className="relative">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Add New Trip</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <TripForm
                onSuccess={() => {
                  setShowAddForm(false)
                  // Refresh the table
                  window.location.reload()
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">🚗 Trip Management</h1>
                <p className="text-gray-600 text-sm lg:text-base">Manage and monitor all trips with audit functionality</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Trip
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <TripTable />
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 