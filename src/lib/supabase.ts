import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '{{SUPABASE_URL}}').trim()
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '{{SUPABASE_ANON_KEY}}').trim()

// Ensure the URL has the proper protocol and no trailing slashes
const normalizedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`
const cleanUrl = normalizedUrl.replace(/\/+$/, '') // Remove trailing slashes

export const supabase = createClient(cleanUrl, supabaseKey)