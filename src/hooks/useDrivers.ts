import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Driver } from '@/types/driver'

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrivers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  const createDriver = async (driverData: Omit<Driver, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert([driverData])
        .select()
        .single()

      if (error) throw error
      setDrivers(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create driver'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateDriver = async (id: string, updates: Partial<Driver>) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setDrivers(prev => prev.map(driver => driver.id === id ? data : driver))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update driver'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteDriver = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setDrivers(prev => prev.filter(driver => driver.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete driver'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  return {
    drivers,
    loading,
    error,
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
  }
} 