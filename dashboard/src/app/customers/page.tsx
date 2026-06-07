import { Header } from '@/components/Header'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CustomerDirectory } from '@/components/CustomerDirectory'
import { InsightsPanel } from '@/components/InsightsPanel'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'

export const revalidate = 5

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

const getCachedRestaurantName = unstable_cache(
  async (restaurantId: string) => {
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single()
    if (error) throw error
    return data?.name || 'Unknown Restaurant'
  },
  ['restaurant-name'],
  { revalidate: 300, tags: ['restaurant'] }
)

const getCachedCustomerReviews = unstable_cache(
  async (restaurantId: string | null, isSuperAdmin: boolean) => {
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating_thumbs,
        public_note,
        photo_url,
        created_at,
        users ( id, full_name, email, phone_number ),
        menu_items!inner (
          id,
          name,
          menu_categories!inner ( restaurant_id )
        )
      `)
      .order('created_at', { ascending: false })

    if (!isSuperAdmin && restaurantId) {
      query = query.eq('menu_items.menu_categories.restaurant_id', restaurantId)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },
  ['customer-reviews'],
  { revalidate: 5, tags: ['reviews'] }
)

export default async function CustomersPage() {
  const headerList = await headers()
  const userId = headerList.get('x-user-id')
  const userEmail = headerList.get('x-user-email')

  if (!userId) redirect('/login')

  const profile = await getCachedUserProfile(userId)

  if (!profile?.managed_restaurant_id && !profile?.is_super_admin) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500">Your account is not linked to a restaurant.</p>
      </div>
    )
  }

  let restaurantName = 'All Restaurants'
  if (profile?.managed_restaurant_id) {
    restaurantName = await getCachedRestaurantName(profile.managed_restaurant_id)
  }

  const reviews = await getCachedCustomerReviews(
    profile.managed_restaurant_id,
    profile.is_super_admin ?? false
  )
  const all = reviews as any[]

  // --- Insights data ---
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const weekly = all.filter((r) => r.created_at >= oneWeekAgo)
  const weeklyStats = {
    total: weekly.length,
    positive: weekly.filter((r) => r.rating_thumbs === true).length,
    negative: weekly.filter((r) => r.rating_thumbs === false).length,
  }

  const menuMap = new Map<string, { id: string; name: string; total: number; positive: number; negative: number; negativeNotes: string[] }>()
  for (const r of all) {
    const item = r.menu_items
    if (!item) continue
    if (!menuMap.has(item.id)) {
      menuMap.set(item.id, { id: item.id, name: item.name, total: 0, positive: 0, negative: 0, negativeNotes: [] })
    }
    const m = menuMap.get(item.id)!
    m.total++
    if (r.rating_thumbs === true) m.positive++
    if (r.rating_thumbs === false) {
      m.negative++
      if (r.public_note) m.negativeNotes.push(r.public_note)
    }
  }
  const menuPerformance = Array.from(menuMap.values()).sort((a, b) => b.total - a.total)

  // --- Customer directory data ---
  const customerMap: Record<string, {
    id: string
    full_name: string | null
    email: string | null
    phone_number: string | null
    reviews: {
      id: string
      rating_thumbs: boolean | null
      public_note: string | null
      photo_url: string | null
      created_at: string
      item_name: string
    }[]
  }> = {}

  for (const r of all) {
    const u = r.users
    const item = r.menu_items
    if (!u?.id) continue
    if (!customerMap[u.id]) {
      customerMap[u.id] = {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone_number: u.phone_number,
        reviews: [],
      }
    }
    customerMap[u.id].reviews.push({
      id: r.id,
      rating_thumbs: r.rating_thumbs,
      public_note: r.public_note,
      photo_url: r.photo_url,
      created_at: r.created_at,
      item_name: item?.name ?? 'Unknown',
    })
  }

  const customers = Object.values(customerMap).sort((a, b) => b.reviews.length - a.reviews.length)

  return (
    <>
      <Header title="Customers & Insights" />
      <main className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-5xl mx-auto space-y-8">

          <InsightsPanel
            restaurantName={restaurantName}
            weeklyStats={weeklyStats}
            menuPerformance={menuPerformance}
            totalCustomers={customers.length}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Diner Directory</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {customers.length} unique diner{customers.length !== 1 ? 's' : ''} have reviewed your restaurant
                </p>
              </div>
              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <CustomerDirectory customers={customers} />
          </div>

        </div>
      </main>
    </>
  )
}
