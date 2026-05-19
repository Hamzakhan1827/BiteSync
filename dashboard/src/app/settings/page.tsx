import { Header } from '@/components/Header'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { RestaurantProfileEditor } from '@/components/RestaurantProfileEditor'
import { FollowupPolicyEditor } from '@/components/FollowupPolicyEditor'
import { AccountSettings } from '@/components/AccountSettings'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('managed_restaurant_id, is_super_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_super_admin) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Super admins manage restaurants from the Menu Manager.</p>
      </div>
    )
  }

  if (!profile?.managed_restaurant_id) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Your account is not linked to a restaurant.</p>
      </div>
    )
  }

  const { data: restaurant } = await supabaseAdmin
    .from('restaurants')
    .select('id, name, address, cuisine_type, opening_hours, logo_url, followup_enabled, followup_policy, followup_discount_percent, followup_custom_template')
    .eq('id', profile.managed_restaurant_id)
    .single()

  if (!restaurant) redirect('/')

  return (
    <>
      <Header title="Restaurant Settings" />
      <main className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-2xl mx-auto space-y-10">

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Restaurant Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This information is shown to diners on the app.</p>
          </div>
          <RestaurantProfileEditor restaurant={restaurant} />

          <hr className="border-slate-200 dark:border-slate-800" />

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">AI Follow-ups</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Automatically reach out to customers after they review your restaurant.</p>
          </div>
          <FollowupPolicyEditor restaurant={restaurant} />

          <hr className="border-slate-200 dark:border-slate-800" />

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your login email and password.</p>
          </div>
          <AccountSettings currentEmail={user.email ?? ""} />

        </div>
      </main>
    </>
  )
}
