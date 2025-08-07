"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useSession } from "@supabase/auth-ui-react"
import { Calendar, MapPin, DollarSign, Car, Loader2, CheckCircle } from "lucide-react"
import { useDrivers } from "@/hooks/useDrivers"

const tripFormSchema = z.object({
  driver_id: z.string().min(1, "Driver is required"),
  date: z.string().min(1, "Date is required"),
  platform: z.enum(["uber", "ola", "rapido", "other"]),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  distance_km: z.coerce.number().min(0, "Distance must be positive"),
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  departure_time: z.string().min(1, "Departure time is required"),
  return_time: z.string().optional(),
  fuel_cost: z.coerce.number().min(0, "Fuel cost must be positive").optional(),
  notes: z.string().optional(),
})

type TripFormData = z.infer<typeof tripFormSchema>

export default function TripSheetForm() {
  const { session } = useSession()
  const { drivers, loading: driversLoading } = useDrivers()
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      platform: "uber",
      departure_time: new Date().toTimeString().slice(0, 5),
    }
  })

  const selectedDriverId = watch("driver_id")
  const selectedDriver = drivers.find(d => d.id === selectedDriverId)

  const onSubmit = async (data: TripFormData) => {
    if (!session) return
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("trips").insert({
        ...data,
        user_id: session.user.id,
        status: "completed",
        created_at: new Date().toISOString(),
      })
      
      if (!error) {
        setSuccess(true)
        reset()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        console.error("Error submitting trip:", error)
      }
    } catch (error) {
      console.error("Error submitting trip:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (driversLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading drivers...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Car className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Trip Entry Form</h2>
          <p className="text-sm text-gray-600">Record your trip details</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Trip submitted successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Driver Selection */}
        <div>
          <label htmlFor="driver_id" className="block text-sm font-medium text-gray-700 mb-2">
            Driver *
          </label>
          <select
            {...register("driver_id")}
            id="driver_id"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} - {driver.phone}
              </option>
            ))}
          </select>
          {errors.driver_id && (
            <p className="mt-1 text-sm text-red-600">{errors.driver_id.message}</p>
          )}
        </div>

        {/* Trip Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
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
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Platform */}
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
              <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
          )}
        </div>

        {/* Time Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-2">
              Departure Time *
            </label>
            <input
              {...register("departure_time")}
              type="time"
              id="departure_time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.departure_time && (
              <p className="mt-1 text-sm text-red-600">{errors.departure_time.message}</p>
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
              <p className="mt-1 text-sm text-red-600">{errors.return_time.message}</p>
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
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
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
              <p className="mt-1 text-sm text-red-600">{errors.distance_km.message}</p>
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
              <p className="mt-1 text-sm text-red-600">{errors.fuel_cost.message}</p>
            )}
          </div>
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
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Driver Info Display */}
        {selectedDriver && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Driver</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {selectedDriver.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">{selectedDriver.name}</p>
                <p className="text-xs text-blue-700">{selectedDriver.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Trip'}
          </button>
        </div>
      </form>
    </div>
  )
} 