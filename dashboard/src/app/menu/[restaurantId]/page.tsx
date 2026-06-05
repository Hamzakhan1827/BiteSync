import { Header } from '@/components/Header'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { MenuManager } from '@/components/MenuManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function RestaurantMenuPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const resolvedParams = await params;
  const restaurantId = resolvedParams.restaurantId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Access Denied</div>;

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('managed_restaurant_id, is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_super_admin && profile?.managed_restaurant_id !== restaurantId) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-xl text-slate-500">You do not have access to manage this restaurant.</p>
      </div>
    )
  }

  // Fetch specific restaurant info to display name
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name')
    .eq('id', restaurantId)
    .single();

  // Fetch Menu Items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select(`
      id,
      name,
      price,
      description,
      image_url,
      category_id,
      menu_categories!inner (
        name,
        restaurant_id
      )
    `)
    .eq('menu_categories.restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  // Fetch Categories for the dropdown
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id, name')
    .eq('restaurant_id', restaurantId);

  // Format menuItems to match MenuItem type (flattening menu_categories array if needed)
  const formattedMenuItems = menuItems?.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    description: item.description,
    image_url: item.image_url,
    category_id: item.category_id,
    menu_categories: Array.isArray(item.menu_categories)
      ? item.menu_categories[0]
      : item.menu_categories
        ? (item.menu_categories as any)
        : undefined
  })) || [];

  return (
    <>
      <Header title={`Menu Manager: ${restaurant?.name || 'Restaurant'}`} />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {profile?.is_super_admin && (
            <Link href="/menu" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Master List
            </Link>
          )}
            <MenuManager 
              initialItems={formattedMenuItems} 
              categories={categories || []} 
              restaurantId={restaurantId} 
              restaurantName={restaurant?.name}
            />
        </div>
      </main>
    </>
  )
}
