import { Header } from '@/components/Header'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { RestaurantManager } from '@/components/RestaurantManager'
import { redirect } from 'next/navigation'

export default async function MasterMenuPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Access Denied</div>;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('managed_restaurant_id, is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_super_admin) {
    if (profile?.managed_restaurant_id) {
      redirect(`/menu/${profile.managed_restaurant_id}`);
    }
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-xl text-slate-500">Your account is not linked to any restaurant. Please contact support.</p>
      </div>
    )
  }

  // Fetch all restaurants for Super Admin
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name, logo_url, address, cuisine_type')
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Platform Master Dashboard" />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <RestaurantManager initialRestaurants={restaurants || []} />
        </div>
      </main>
    </>
  )
}
