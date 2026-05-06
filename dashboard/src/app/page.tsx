import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Star, TrendingDown, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Access Denied</div>;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('managed_restaurant_id, is_super_admin')
    .eq('id', user.id)
    .single();

  // Fetch Menu Items
  let query = supabase
    .from('menu_items')
    .select(`
      id,
      name,
      price,
      menu_categories!inner (
        name,
        restaurant_id
      )
    `);

  if (!profile?.is_super_admin) {
    if (!profile?.managed_restaurant_id) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
          <p className="text-xl text-slate-500">Your account is not linked to any restaurant. Please contact support.</p>
        </div>
      )
    }
    query = query.eq('menu_categories.restaurant_id', profile.managed_restaurant_id);
  }

  const { data: menuItems } = await query;

  return (
    <>
      <Header title="Dashboard Overview" />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium">Total Reviews</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">124</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                +12% from last week
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                <TrendingDown className="w-5 h-5 text-emerald-500" />
                <h3 className="font-medium">Avg Satisfaction</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">92%</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1">
                +2% from last week
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-2">
                <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h3 className="font-medium">Return Rate</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">45%</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1">
                Stable
              </p>
            </div>
          </div>

          {/* Menu Items Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Menu Item Leaderboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Live performance of your dishes based on diner feedback.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold transition-colors">
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {menuItems?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {item.menu_categories?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">PKR {item.price}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/analytics/${item.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-end gap-1 w-full transition-colors">
                          View Analytics <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!menuItems || menuItems.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No menu items found. Please check your database connection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
