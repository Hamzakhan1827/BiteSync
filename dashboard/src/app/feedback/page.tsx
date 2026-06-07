import { supabaseAdmin } from '@/lib/supabase-admin'
import { Header } from '@/components/Header'
import { FeedbackManager } from '@/components/FeedbackManager'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'

export const revalidate = 5; // Cache for 5s, server-refresh in background

const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('managed_restaurant_id, is_super_admin')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },
  ['user-profile'],
  { revalidate: 60, tags: ['profile'] }
)

const getCachedFeedbackReviews = unstable_cache(
  async (restaurantId: string | null, isSuperAdmin: boolean) => {
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating_thumbs,
        public_note,
        photo_url,
        created_at,
        owner_reply,
        owner_reply_at,
        menu_items!inner (
          id,
          name,
          menu_categories!inner (restaurant_id, restaurants(name))
        ),
        users (email, phone_number, full_name)
      `)
      .order('created_at', { ascending: false });

    if (!isSuperAdmin && restaurantId) {
      query = query.eq('menu_items.menu_categories.restaurant_id', restaurantId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
  ['feedback-reviews'],
  { revalidate: 5, tags: ['reviews'] }
)

export default async function FeedbackPage() {
  const headerList = await headers()
  const userId = headerList.get('x-user-id')
  const userEmail = headerList.get('x-user-email')

  if (!userId) redirect('/login')

  const profile = await getCachedUserProfile(userId)

  if (!profile?.is_super_admin && !profile?.managed_restaurant_id) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-xl text-slate-500">Your account is not linked to any restaurant.</p>
      </div>
    )
  }

  const reviews = await getCachedFeedbackReviews(
    profile.managed_restaurant_id,
    profile.is_super_admin ?? false
  )

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

          <Suspense>
            <FeedbackManager reviews={(reviews || []).map((r: any) => ({
              ...r,
              restaurantName: r.menu_items?.menu_categories?.restaurants?.name,
            }))} />
          </Suspense>

        </div>
      </main>
    </>
  )
}
