import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Attendance } from '@/types/attendance'

export function useAttendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendance = async (date?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('attendance')
        .select(`
          *,
          drivers (
            id,
            name,
            email,
            phone
          )
        `)
        .order('date', { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query

      if (error) throw error
      setAttendance(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance')
    } finally {
      setLoading(false)
    }
  }

  const createAttendance = async (attendanceData: Omit<Attendance, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendanceData])
        .select()
        .single()

      if (error) throw error
      setAttendance(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create attendance record'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateAttendance = async (id: string, updates: Partial<Attendance>) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setAttendance(prev => prev.map(record => record.id === id ? data : record))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update attendance record'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteAttendance = async (id: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id)

      if (error) throw error
      setAttendance(prev => prev.filter(record => record.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete attendance record'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const getAttendanceByDriver = async (driverId: string, startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('driver_id', driverId)
        .order('date', { ascending: false })

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch driver attendance'
      return { data: [], error: errorMessage }
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  return {
    attendance,
    loading,
    error,
    fetchAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceByDriver,
  }
} 