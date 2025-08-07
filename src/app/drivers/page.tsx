"use client"

import { useSession } from "@supabase/auth-ui-react"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plane, LogOut } from 'lucide-react'
import AddDriverForm from '@/components/drivers/AddDriverForm'
import DriverTable from '@/components/drivers/DriverTable'
import type { Driver } from '@/types/driver'
import { supabase } from '@/lib/supabase'

export default function DriversPage() {
  const { session } = useSession()
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleEditDriver = (driver: Driver) => {
    // TODO: Implement edit functionality
    console.log('Edit driver:', driver)
  }

  const handleDeleteDriver = (driver: Driver) => {
    // TODO: Implement delete functionality
    console.log('Delete driver:', driver)
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    // Refresh the table or show success message
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
                Welcome, {session.user.email}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
            <p className="text-gray-600">Manage your driver fleet</p>
          </div>
          <AddDriverForm 
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>

        {/* Drivers Table */}
        <DriverTable 
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
        />
      </main>
    </div>
  )
} 