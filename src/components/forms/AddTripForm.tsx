'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { uploadTripPhoto } from '@/lib/storage'
import { Calendar, MapPin, Fuel, DollarSign, FileText, Upload, Loader2, CheckCircle } from 'lucide-react'

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  km: z.coerce.number().min(1, "KM must be at least 1"),
  fuel: z.coerce.number().optional(),
  earning: z.coerce.number().optional(),
  remarks: z.string().optional(),
  photo: z.any().optional(),
})

export default function AddTripForm({ driverId }: { driverId: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    setSuccess(false)

    try {
      // Upload photo if exists
      let photo_url = null
      if (data.photo?.[0]) {
        const file = data.photo[0]
        const uploaded = await uploadTripPhoto(driverId, file)
        if (uploaded?.path) photo_url = uploaded.path
      }

      // Detect anomalies
      const anomalies = []
      if (data.km < 10) anomalies.push('Very low KM')
      if (data.km > 300) anomalies.push('Unusually high KM')
      if (data.fuel && data.fuel > 30) anomalies.push('High fuel usage')
      if (!photo_url) anomalies.push('Missing dashboard photo')

      const anomaly_flag = anomalies.length > 0

      // Save trip
      const { error } = await supabase.from('trips').insert([
        {
          driver_id: driverId,
          date: data.date,
          distance_km: data.km,
          fuel_cost: data.fuel,
          amount: data.earning,
          notes: data.remarks,
          photo_url,
          anomaly_flag,
          audit_status: anomaly_flag ? 'needs_review' : 'verified',
          created_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error('Error saving trip:', error)
        alert('Failed to save trip: ' + error.message)
        return
      }

      setSuccess(true)
      reset()
      setPhotoPreview(null)
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save trip')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Trip</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Trip Date *
          </label>
          <input 
            type="date" 
            {...register('date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
        </div>

        {/* KM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Distance (KM) *
          </label>
          <input 
            type="number" 
            placeholder="Enter distance in KM"
            {...register('km')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.km && <p className="text-red-500 text-sm mt-1">{errors.km.message}</p>}
        </div>

        {/* Fuel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Fuel className="inline h-4 w-4 mr-1" />
            Fuel (litres)
          </label>
          <input 
            type="number" 
            placeholder="Enter fuel consumption"
            {...register('fuel')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Earning */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Earning (₹)
          </label>
          <input 
            type="number" 
            placeholder="Enter trip earning"
            {...register('earning')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline h-4 w-4 mr-1" />
            Remarks
          </label>
          <textarea 
            placeholder="Any additional notes..."
            {...register('remarks')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Upload className="inline h-4 w-4 mr-1" />
            Dashboard Photo
          </label>
          <input 
            type="file" 
            accept="image/*" 
            {...register('photo')}
            onChange={handlePhotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Photo Preview */}
          {photoPreview && (
            <div className="mt-2">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="h-24 w-24 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-md">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Trip saved successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={submitting} 
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Saving...' : 'Save Trip'}
        </button>
      </form>
    </div>
  )
} 