import { Header } from '@/components/Header'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { Building2, Users, Star, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export const revalidate = 0

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) redirect('/')

  const [
    { data: restaurants },
    { count: totalDiners },
    { count: totalReviews },
    { count: followupEmailsSent },
    { count: failedEmails },
    { count: winbackSent },
    { data: allReviews },
  ] = await Promise.all([
    supabaseAdmin
      .from('restaurants')
      .select('id, name, followup_enabled, recovery_emails_enabled, winback_emails_enabled, created_at')
      .order('created_at', { ascending: false }),

    supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('is_super_admin', false)
      .is('managed_restaurant_id', null),

    supabaseAdmin
      .from('reviews')
      .select('id', { count: 'exact', head: true }),

    supabaseAdmin
      .from('ai_followup_log')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent'),

    supabaseAdmin
      .from('ai_followup_log')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed'),

    supabaseAdmin
      .from('winback_log')
      .select('id', { count: 'exact', head: true }),

    supabaseAdmin
      .from('reviews')
      .select('created_at, menu_items!inner(menu_categories!inner(restaurant_id))')
      .order('created_at', { ascending: false }),
  ])

  // Build per-restaurant review stats
  const restaurantStats: Record<string, { count: number; lastAt: string | null }> = {}
  for (const r of (allReviews ?? [])) {
    const restId = (r as any).menu_items?.menu_categories?.restaurant_id
    if (!restId) continue
    if (!restaurantStats[restId]) restaurantStats[restId] = { count: 0, lastAt: null }
    restaurantStats[restId].count++
    if (!restaurantStats[restId].lastAt) restaurantStats[restId].lastAt = r.created_at
  }

  const totalEmailsSent = (followupEmailsSent ?? 0) + (winbackSent ?? 0)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  return (
    <>
      <Header title="Platform Overview" />
      <main className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Building2 className="w-5 h-5 text-violet-500" />}
              bg="bg-violet-100 dark:bg-violet-900/30"
              value={restaurants?.length ?? 0}
              label="Restaurants"
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-500" />}
              bg="bg-blue-100 dark:bg-blue-900/30"
              value={totalDiners ?? 0}
              label="Diners"
            />
            <StatCard
              icon={<Star className="w-5 h-5 text-amber-500" />}
              bg="bg-amber-100 dark:bg-amber-900/30"
              value={totalReviews ?? 0}
              label="Total Reviews"
            />
            <StatCard
              icon={<Mail className="w-5 h-5 text-emerald-500" />}
              bg="bg-emerald-100 dark:bg-emerald-900/30"
              value={totalEmailsSent}
              label="Emails Sent"
              sub="AI follow-ups + win-backs"
            />
          </div>

          {/* Issues Banner */}
          {(failedEmails ?? 0) > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-4">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {failedEmails} email{failedEmails !== 1 ? 's' : ''} failed to deliver. Check Resend logs or domain config.
              </p>
            </div>
          )}

          {/* Restaurant Health Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Restaurant Health</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All restaurants on the platform with activity and feature status.</p>
            </div>

            {!restaurants?.length ? (
              <div className="px-6 py-16 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No restaurants yet</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="px-6 py-4">Restaurant</th>
                    <th className="px-6 py-4 text-center">Reviews</th>
                    <th className="px-6 py-4 text-center">Last Review</th>
                    <th className="px-6 py-4 text-center">AI Follow-up</th>
                    <th className="px-6 py-4 text-center">Recovery</th>
                    <th className="px-6 py-4 text-center">Win-Back</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {restaurants.map((r) => {
                    const stats = restaurantStats[r.id] ?? { count: 0, lastAt: null }
                    const isInactive = !stats.lastAt || stats.lastAt < sevenDaysAgo
                    const noFeaturesEnabled = !r.followup_enabled && !r.recovery_emails_enabled && !r.winback_emails_enabled
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{r.name}</p>
                          {noFeaturesEnabled && (
                            <p className="text-xs text-amber-500 mt-0.5">No features enabled</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black text-slate-900 dark:text-slate-100">{stats.count}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs text-slate-500">{stats.lastAt ? timeAgo(stats.lastAt) : 'Never'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <FeatureDot enabled={r.followup_enabled ?? false} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <FeatureDot enabled={r.recovery_emails_enabled ?? false} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <FeatureDot enabled={r.winback_emails_enabled ?? false} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isInactive ? (
                            <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                              Inactive
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </>
  )
}

function StatCard({
  icon, bg, value, label, sub,
}: {
  icon: React.ReactNode
  bg: string
  value: number
  label: string
  sub?: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-sm font-semibold text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function FeatureDot({ enabled }: { enabled: boolean }) {
  return enabled
    ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
    : <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
}
