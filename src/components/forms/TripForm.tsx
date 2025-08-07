"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Upload, X, Camera, User, Calendar, MapPin, Fuel, DollarSign, FileText } from 'lucide-react'
import { uploadTripPhoto } from '@/lib/storage'

const tripSchema = z.object({
  driver_id: z.string().min(1, 'Driver is required'),
  date: z.string().min(1, 'Date is required'),
  platform: z.enum(['uber', 'ola', 'rapido', 'other']),
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  departure_time: z.string().min(1, 'Departure time is required'),
  return_time: z.string().optional(),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  distance_km: z.coerce.number().min(0, 'Distance must be positive'),
  fuel_cost: z.coerce.number().min(0, 'Fuel cost must be positive').optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('completed'),
  photo: z.any().optional(),
})

type TripFormData = z.infer<typeof tripSchema>

interface TripFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: Partial<TripFormData>
  mode?: 'create' | 'edit'
}

export default function TripForm({ onSuccess, onCancel, initialData, mode = 'create' }: TripFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [drivers, setDrivers] = useState<any[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: initialData,
  })

  // Fetch drivers on component mount
  useState(() => {
    const fetchDrivers = async () => {
      const { data } = await supabase.from('drivers').select('id, name, phone')
      if (data) setDrivers(data)
    }
    fetchDrivers()
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: TripFormData) => {
    setSubmitting(true)
    try {
      let photo_url = null

      // Upload photo if provided
      if (data.photo?.[0]) {
        const file = data.photo[0]
        const uploaded = await uploadTripPhoto(data.driver_id, file)
        if (uploaded?.path) photo_url = uploaded.path
      }

      // Detect anomalies
      const anomalies = []
      if (data.distance_km < 5) anomalies.push('Very low KM')
      if (data.distance_km > 300) anomalies.push('Unusually high KM')
      if (data.fuel_cost && data.fuel_cost > 30) anomalies.push('High fuel usage')
      if (!photo_url) anomalies.push('Missing dashboard photo')

      const anomaly_flag = anomalies.length > 0

      const tripData = {
        ...data,
        photo_url,
        anomaly_flag,
        audit_status: anomaly_flag ? 'needs_review' : 'verified',
        created_at: new Date().toISOString(),
      }

      if (mode === 'edit' && initialData?.id) {
        const { error } = await supabase
          .from('trips')
          .update(tripData)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('trips').insert([tripData])
        if (error) throw error
      }

      reset()
      setPhotoPreview(null)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('Error saving trip. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
      {/* Driver Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <User className="inline h-4 w-4 mr-1" />
          Driver *
        </label>
        <select
          {...register('driver_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a driver</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name} - {driver.phone}
            </option>
          ))}
        </select>
        {errors.driver_id && (
          <p className="text-red-500 text-sm">{errors.driver_id.message}</p>
        )}
      </div>

      {/* Date and Platform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date *
          </label>
          <input
            type="date"
            {...register('date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && (
            <p className="text-red-500 text-sm">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Platform *
          </label>
          <select
            {...register('platform')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select platform</option>
            <option value="uber">Uber</option>
            <option value="ola">Ola</option>
            <option value="rapido">Rapido</option>
            <option value="other">Other</option>
          </select>
          {errors.platform && (
            <p className="text-red-500 text-sm">{errors.platform.message}</p>
          )}
        </div>
      </div>

      {/* Destination */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <MapPin className="inline h-4 w-4 mr-1" />
          Destination *
        </label>
        <input
          type="text"
          placeholder="Enter destination"
          {...register('destination')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.destination && (
          <p className="text-red-500 text-sm">{errors.destination.message}</p>
        )}
      </div>

      {/* Times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Departure Time *
          </label>
          <input
            type="time"
            {...register('departure_time')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.departure_time && (
            <p className="text-red-500 text-sm">{errors.departure_time.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Return Time
          </label>
          <input
            type="time"
            {...register('return_time')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.return_time && (
            <p className="text-red-500 text-sm">{errors.return_time.message}</p>
          )}
        </div>
      </div>

      {/* Amount and Distance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Amount (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <MapPin className="inline h-4 w-4 mr-1" />
            Distance (KM) *
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="0.0"
            {...register('distance_km')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.distance_km && (
            <p className="text-red-500 text-sm">{errors.distance_km.message}</p>
          )}
        </div>
      </div>

      {/* Fuel Cost */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Fuel className="inline h-4 w-4 mr-1" />
          Fuel Cost (₹)
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('fuel_cost')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.fuel_cost && (
          <p className="text-red-500 text-sm">{errors.fuel_cost.message}</p>
        )}
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Camera className="inline h-4 w-4 mr-1" />
          Dashboard Photo
        </label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            {...register('photo')}
            onChange={handlePhotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {photoPreview && (
            <div className="relative inline-block">
              <img
                src={photoPreview}
                alt="Preview"
                className="h-24 w-24 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        {errors.photo && (
          <p className="text-red-500 text-sm">{errors.photo.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <FileText className="inline h-4 w-4 mr-1" />
          Notes
        </label>
        <textarea
          rows={3}
          placeholder="Additional notes..."
          {...register('notes')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.notes && (
          <p className="text-red-500 text-sm">{errors.notes.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {errors.status && (
          <p className="text-red-500 text-sm">{errors.status.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {mode === 'edit' ? 'Update Trip' : 'Save Trip'}
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
} 