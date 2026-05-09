import { supabaseAdmin } from '@/lib/supabase-admin'
import { Header } from '@/components/Header'
import { FeedbackManager } from '@/components/FeedbackManager'

import { createClient } from '@/utils/supabase/server'

export const revalidate = 0; // Disable cache so we always see live data

export default async function FeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Access Denied</div>;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('managed_restaurant_id, is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_super_admin && !profile?.managed_restaurant_id) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-xl text-slate-500">Your account is not linked to any restaurant.</p>
      </div>
    )
  }

  // Fetch the actual reviews securely bypassing RLS!
  let query = supabaseAdmin
    .from('reviews')
    .select(`
      id,
      rating_thumbs,
      public_note,
      photo_url,
      created_at,
      menu_items!inner (
        name,
        menu_categories!inner (restaurant_id)
      ),
      users (email, phone_number, full_name)
    `)
    .order('created_at', { ascending: false });

  if (!profile?.is_super_admin) {
    query = query.eq('menu_items.menu_categories.restaurant_id', profile.managed_restaurant_id);
  }

  const { data: reviews } = await query;

  return (
    <>
      <Header title="Live Feedback Stream" />
      <main className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Diner Feedback</h2>
            <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Updates
            </div>
          </div>

          <FeedbackManager reviews={reviews || []} />

        </div>
      </main>
    </>
  )
}
