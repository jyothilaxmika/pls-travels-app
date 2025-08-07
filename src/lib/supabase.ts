import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  'https://oiizdjzegvkqimbwjzax.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9paXpkanplZ3ZrcWltYndqemF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU1MzkzNiwiZXhwIjoyMDcwMTI5OTM2fQ.B9OVlqNf4WxRAI87wSgCzppAvfrkcqZy8wPJWVcWqgU'
) 