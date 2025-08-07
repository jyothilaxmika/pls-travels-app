"use client"

import { SessionContextProvider } from "@supabase/auth-ui-react"
import { supabase } from "@/lib/supabase"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  )
} 