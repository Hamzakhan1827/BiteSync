import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// This client bypasses RLS entirely. 
// It MUST NEVER be used on the client-side (browser), only in Server Components or API Routes.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
