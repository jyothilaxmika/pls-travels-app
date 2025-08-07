import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trip } from '@/types/trip'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          drivers (
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrips(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips')
    } finally {
      setLoading(false)
    }
  }

  const createTrip = async (tripData: Omit<Trip, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single()

      if (error) throw error
      setTrips(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trip'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTrips(prev => prev.map(trip => trip.id === id ? data : trip))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trip'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTrips(prev => prev.filter(trip => trip.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trip'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  }
} 