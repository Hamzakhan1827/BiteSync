import Link from 'next/link'
import { Utensils, Star, TrendingDown, Users, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { signOut } from '@/app/actions/auth'

export async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let displayName = "Loading...";
  let planName = "Accessing...";
  let initial = "B";

  if (user) {
    // Fetch the user's role and managed restaurant from public.users using admin client to bypass RLS if needed
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('is_super_admin, managed_restaurant_id, restaurants(name)')
      .eq('id', user.id)
      .single();

    if (profile?.is_super_admin) {
      displayName = "BiteSync Network";
      planName = "Platform Owner";
      initial = "⚡";
    } else if (profile?.restaurants) {
      displayName = profile.restaurants.name;
      planName = "Pro Plan";
      initial = displayName.charAt(0).toUpperCase();
    } else {
      displayName = "Unauthorized Access";
      planName = "No Restaurant Linked";
      initial = "❌";
    }
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col h-screen sticky top-0 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
        <Link href="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight">
          <Utensils className="w-6 h-6" />
          <span>BiteSync</span>
        </Link>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</p>
        <nav className="space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md font-medium transition-colors">
            <TrendingDown className="w-5 h-5" />
            Overview
          </Link>
          <Link href="/feedback" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md font-medium transition-colors">
            <Star className="w-5 h-5" />
            Feedback Hub
          </Link>
          <Link href="/customers" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md font-medium transition-colors">
            <Users className="w-5 h-5" />
            Customers
          </Link>
        </nav>
      </div>
      <div className="px-4 py-3 shrink-0">
        <form action={signOut}>
          <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate" title={displayName}>{displayName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{planName}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
