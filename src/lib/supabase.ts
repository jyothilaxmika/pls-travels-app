import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hqbpxtmwunapxzmdbtjs.supabase.co').trim()
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_flHqSxia47fz2n-6GjxWzw_mKXITP1x').trim()

// Ensure the URL has the proper protocol and no trailing slashes
const normalizedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`
const cleanUrl = normalizedUrl.replace(/\/+$/, '') // Remove trailing slashes

export const supabase = createClient(cleanUrl, supabaseKey)