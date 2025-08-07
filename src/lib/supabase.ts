import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oiizdjzegvkqimbwjzax.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paXpkanplZ3ZrcWltYndqemF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1MzkzNiwiZXhwIjoyMDcwMTI5OTM2fQ.B9OVlqNf4WxRAI87wSgCzppAvfrkcqZy8wPJWVcWqgU'

// Ensure the URL has the proper protocol
const normalizedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`

export const supabase = createClient(normalizedUrl, supabaseKey)