import { createClient } from '@supabase/supabase-js'

const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  envSupabaseUrl &&
    envSupabaseAnonKey &&
    !envSupabaseUrl.includes('{{') &&
    !envSupabaseAnonKey.includes('{{')
)

const supabaseUrl = (envSupabaseUrl || '{{SUPABASE_URL}}').trim()
const supabaseKey = (envSupabaseAnonKey || '{{SUPABASE_ANON_KEY}}').trim()

// Ensure the URL has the proper protocol and no trailing slashes
const normalizedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`
const cleanUrl = normalizedUrl.replace(/\/+$/, '') // Remove trailing slashes

export const supabase = createClient(cleanUrl, supabaseKey)