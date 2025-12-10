import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[v0] Supabase no está configurado. Por favor, agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY a las variables de entorno.",
    )
    // Retornar un cliente simulado para evitar errores
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}