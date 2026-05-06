import { supabaseAdmin } from '@/lib/supabase-admin'
import { Header } from '@/components/Header'
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'

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

          {reviews && reviews.length > 0 ? (
            reviews.map((review: any) => (
              <div key={review.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 transition-colors">
                <div className="shrink-0 mt-1">
                  {review.rating_thumbs ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-full">
                      <ThumbsUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                    </div>
                  ) : review.rating_thumbs === false ? (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full">
                      <ThumbsDown className="w-6 h-6 text-red-500 dark:text-red-400" />
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-full">
                      <MessageSquare className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {review.menu_items?.name || 'Unknown Item'}
                      </h3>
                      {/* Customer Intelligence: Render Email / Phone */}
                      <div className="flex flex-col mt-1">
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {review.users?.full_name || 'Anonymous Diner'}
                        </span>
                        {(review.users?.email || review.users?.phone_number) && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {review.users?.email && `✉️ ${review.users.email} `}
                            {review.users?.phone_number && `📞 ${review.users.phone_number}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(review.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {review.public_note ? (
                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      "{review.public_note}"
                    </p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-500 italic">No public note left by diner.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-12">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p>No feedback yet. Tell your diners to start rating!</p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
