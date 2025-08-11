"use client"

import { useAuth } from "@/hooks/useAuth"
import { useState } from 'react'
import { Plus } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import AddDriverForm from '@/components/drivers/AddDriverForm'
import DriverTable from '@/components/drivers/DriverTable'
import EditDriverForm from '@/components/forms/EditDriverForm'
import type { Driver } from '@/types/driver'

export default function DriversPage() {
  const { user, loading } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver)
  }

  const handleDeleteDriver = (driver: Driver) => {
    // TODO: Implement delete functionality
    console.log('Delete driver:', driver)
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
  }

  const handleEditSuccess = () => {
    setEditingDriver(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
            <p className="text-gray-600">Manage your driver fleet</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </button>
        </div>

        <DriverTable 
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
        />
      </div>

      {/* Add Driver Modal */}
      {showAddForm && (
        <AddDriverForm 
          onSuccess={handleAddSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Driver Modal */}
      {editingDriver && (
        <EditDriverForm
          driver={editingDriver}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingDriver(null)}
        />
      )}
    </Layout>
  )
} 