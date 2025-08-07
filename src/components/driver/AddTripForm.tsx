"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { supabase } from "@/lib/supabase"
import { MapPin, DollarSign, Calendar, Clock, Loader2, CheckCircle, Plus, X, Upload, Image } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface TripFormData {
  date: string
  platform: "uber" | "ola" | "rapido" | "other"
  destination: string
  departure_time: string
  return_time?: string
  amount: number
  distance_km: number
  fuel_cost?: number
  notes?: string
  photo?: any
}

interface AddTripFormProps {
  driverId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AddTripForm({ driverId, onSuccess, onCancel }: AddTripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TripFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      platform: "uber",
      departure_time: new Date().toTimeString().slice(0, 5),
    }
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const onSubmit = async (data: TripFormData) => {
    setIsSubmitting(true)
    setUploading(true)

    try {
      let photoUrl = null

      // Upload image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${driverId}/${uuidv4()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('trip-photos')
          .upload(fileName, selectedFile)

        if (uploadError) {
          console.error("Upload error", uploadError)
          alert("Image upload failed")
          setIsSubmitting(false)
          setUploading(false)
          return
        }

        const { data: urlData } = supabase
          .storage
          .from('trip-photos')
          .getPublicUrl(fileName)

        photoUrl = urlData?.publicUrl
      }

      // Insert trip data with photo URL
      const { error } = await supabase
        .from("trips")
        .insert({
          ...data,
          driver_id: driverId,
          status: "completed",
          created_at: new Date().toISOString(),
          photo_url: photoUrl,
        })

      if (error) {
        console.error('Error adding trip:', error)
      } else {
        setSuccess(true)
        reset()
        setSelectedFile(null)
        setPreviewUrl(null)
        setTimeout(() => {
          setSuccess(false)
          setShowForm(false)
          onSuccess?.()
        }, 1500)
      }
    } catch (error) {
      console.error('Error adding trip:', error)
    } finally {
      setIsSubmitting(false)
      setUploading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Trip Entry</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Trip
          </button>
        </div>
        <p className="text-gray-600">Click "Add Trip" to record a new trip for this driver.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Trip</h2>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {success && (
        <div className="p-6 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Trip added successfully!</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date and Platform */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Trip Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register("date")}
                type="date"
                id="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{String(errors.date.message)}</p>
            )}
          </div>

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
              Platform *
            </label>
            <select
              {...register("platform")}
              id="platform"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="uber">Uber</option>
              <option value="ola">Ola</option>
              <option value="rapido">Rapido</option>
              <option value="other">Other</option>
            </select>
            {errors.platform && (
              <p className="mt-1 text-sm text-red-600">{String(errors.platform.message)}</p>
            )}
          </div>
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Destination *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              {...register("destination")}
              type="text"
              id="destination"
              placeholder="Enter destination"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{String(errors.destination.message)}</p>
          )}
        </div>

        {/* Time Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-2">
              Departure Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register("departure_time")}
                type="time"
                id="departure_time"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.departure_time && (
              <p className="mt-1 text-sm text-red-600">{String(errors.departure_time.message)}</p>
            )}
          </div>

          <div>
            <label htmlFor="return_time" className="block text-sm font-medium text-gray-700 mb-2">
              Return Time
            </label>
            <input
              {...register("return_time")}
              type="time"
              id="return_time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.return_time && (
              <p className="mt-1 text-sm text-red-600">{String(errors.return_time.message)}</p>
            )}
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount Collected *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register("amount")}
                type="number"
                step="0.01"
                id="amount"
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{String(errors.amount.message)}</p>
            )}
          </div>

          <div>
            <label htmlFor="distance_km" className="block text-sm font-medium text-gray-700 mb-2">
              Distance (km) *
            </label>
            <input
              {...register("distance_km")}
              type="number"
              step="0.1"
              id="distance_km"
              placeholder="0.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.distance_km && (
              <p className="mt-1 text-sm text-red-600">{String(errors.distance_km.message)}</p>
            )}
          </div>

          <div>
            <label htmlFor="fuel_cost" className="block text-sm font-medium text-gray-700 mb-2">
              Fuel Cost
            </label>
            <input
              {...register("fuel_cost")}
              type="number"
              step="0.01"
              id="fuel_cost"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.fuel_cost && (
              <p className="mt-1 text-sm text-red-600">{String(errors.fuel_cost.message)}</p>
            )}
          </div>
        </div>

                 {/* Dashboard Photo */}
         <div>
           <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
             Dashboard Photo
           </label>
           <div className="space-y-3">
             <div className="relative">
               <input
                 type="file"
                 accept="image/*"
                 onChange={handleFileChange}
                 id="photo"
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
               <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
             </div>
             
             {/* Image Preview */}
             {previewUrl && (
               <div className="mt-3">
                 <div className="flex items-center gap-2 mb-2">
                   <Image className="h-4 w-4 text-blue-600" />
                   <span className="text-sm font-medium text-gray-700">Preview:</span>
                 </div>
                 <div className="relative inline-block">
                   <img
                     src={previewUrl}
                     alt="Preview"
                     className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                   />
                   <button
                     type="button"
                     onClick={() => {
                       setSelectedFile(null)
                       setPreviewUrl(null)
                     }}
                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                   >
                     ×
                   </button>
                 </div>
               </div>
             )}
           </div>
           {errors.photo && (
             <p className="mt-1 text-sm text-red-600">{String(errors.photo.message)}</p>
           )}
         </div>

         {/* Notes */}
         <div>
           <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
             Notes
           </label>
           <textarea
             {...register("notes")}
             id="notes"
             rows={3}
             placeholder="Any additional notes about the trip..."
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           />
           {errors.notes && (
             <p className="mt-1 text-sm text-red-600">{String(errors.notes.message)}</p>
           )}
         </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
                     <button
             type="submit"
             disabled={isSubmitting || uploading}
             className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             {(isSubmitting || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
             {uploading ? 'Uploading...' : isSubmitting ? 'Adding Trip...' : 'Add Trip'}
           </button>
        </div>
      </form>
    </div>
  )
} 