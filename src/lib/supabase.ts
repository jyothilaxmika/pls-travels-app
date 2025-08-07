import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oiizdjzegvkqimbwjzax.supabase.co').trim()
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paXpkanplZ3ZrcWltYndqemF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1MzkzNiwiZXhwIjoyMDcwMTI5OTM2fQ.B9OVlqNf4WxRAI87wSgCzppAvfrkcqZy8wPJWVcWqgU').trim()

// Ensure the URL has the proper protocol and no trailing slashes
const normalizedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`
const cleanUrl = normalizedUrl.replace(/\/+$/, '') // Remove trailing slashes

export const supabase = createClient(cleanUrl, supabaseKey)