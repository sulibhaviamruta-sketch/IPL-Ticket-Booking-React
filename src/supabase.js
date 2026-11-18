import { createClient } from '@supabase/supabase-js'

const supabaseUr1 = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUr1,supabaseKey)