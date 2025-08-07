"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { driverSchema, type DriverFormData } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { DRIVER_STATUS } from '@/lib/constants'

interface EditDriverFormProps {
  driver: {
    id: string
    name: string
    phone: string
    email?: string
    license_number: string
    license_expiry: string
    joining_date: string
    status: string
    address?: string
    emergency_contact?: string
    emergency_phone?: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EditDriverForm({ driver, onSuccess, onCancel }: EditDriverFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: driver.name,
      phone: driver.phone,
      email: driver.email || '',
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
      joining_date: driver.joining_date,
      status: driver.status as 'active' | 'inactive' | 'suspended',
      address: driver.address || '',
      emergency_contact: driver.emergency_contact || '',
      emergency_phone: driver.emergency_phone || ''
    }
  })

  const onSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('drivers')
        .update(data)
        .eq('id', driver.id)

      if (error) {
        console.error('Error updating driver:', error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
        }, 1500)
      }
    } catch (error) {
      console.error('Error updating driver:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Driver Profile</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Driver updated successfully!</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter driver's full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date *
                </label>
                <input
                  {...register('joining_date')}
                  type="date"
                  id="joining_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.joining_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.joining_date.message}</p>
                )}
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">License Information</h3>
              
              <div>
                <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
                  License Number *
                </label>
                <input
                  {...register('license_number')}
                  type="text"
                  id="license_number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter license number"
                />
                {errors.license_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.license_number.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="license_expiry" className="block text-sm font-medium text-gray-700 mb-1">
                  License Expiry Date *
                </label>
                <input
                  {...register('license_expiry')}
                  type="date"
                  id="license_expiry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.license_expiry && (
                  <p className="mt-1 text-sm text-red-600">{errors.license_expiry.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DRIVER_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              id="address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name
              </label>
              <input
                {...register('emergency_contact')}
                type="text"
                id="emergency_contact"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter emergency contact name"
              />
              {errors.emergency_contact && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emergency_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                {...register('emergency_phone')}
                type="tel"
                id="emergency_phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter emergency contact phone"
              />
              {errors.emergency_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_phone.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Update Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 