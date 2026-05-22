'use server'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function uploadRestaurantLogo(formData: FormData) {
  if (!await assertSuperAdmin()) return { error: 'Unauthorized' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  const bytes = await file.arrayBuffer()
  const fileExt = file.name.split('.').pop()
  const fileName = `logos/${Math.random()}.${fileExt}`

  const { error } = await supabaseAdmin.storage
    .from('review-photos')
    .upload(fileName, bytes, { contentType: file.type })

  if (error) return { error: error.message }

  const { data } = supabaseAdmin.storage.from('review-photos').getPublicUrl(fileName)
  return { url: data.publicUrl }
}

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_super_admin ? user : null
}

export async function createRestaurant(payload: {
  name: string
  address: string
  cuisine_type?: string
  logo_url?: string | null
}) {
  if (!await assertSuperAdmin()) return { error: 'Unauthorized' }

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .insert([{ name: payload.name, address: payload.address, cuisine_type: payload.cuisine_type, logo_url: payload.logo_url }])
    .select()
    .single()

  if (error) return { error: error.message }

  const defaults = ['Appetizers', 'BBQ', 'Beverages', 'Burgers', 'Chinese', 'Desserts', 'Fast Food', 'Karahi', 'Pasta', 'Pizza', 'Salads', 'Sandwiches', 'Seafood', 'Steaks', 'Wraps']
  await supabaseAdmin.from('menu_categories').insert(defaults.map(name => ({ restaurant_id: data.id, name })))

  return { data }
}

export async function updateRestaurant(payload: {
  id: string
  name: string
  address: string
  cuisine_type?: string
  logo_url?: string | null
}) {
  if (!await assertSuperAdmin()) return { error: 'Unauthorized' }

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .update({ name: payload.name, address: payload.address, cuisine_type: payload.cuisine_type, logo_url: payload.logo_url })
    .eq('id', payload.id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteRestaurant(id: string) {
  if (!await assertSuperAdmin()) return { error: 'Unauthorized' }

  const { error } = await supabaseAdmin.from('restaurants').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
