import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { BarChart3, AlertCircle } from 'lucide-react'

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
  // Wait for the dynamic params to resolve
  const resolvedParams = await params;
  const itemId = resolvedParams.id;

  const { data: item } = await supabase
    .from('menu_items')
    .select('name')
    .eq('id', itemId)
    .single()

  return (
    <>
      <Header title={`Analytics: ${item?.name || 'Item'}`} />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Deep Dive Analytics</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              This page will display the specific attribute distribution for <strong>{item?.name}</strong>. 
              For example, you will see a bell-curve chart showing whether people found it "Too Mild" or "Too Spicy" based on the sliders they filled out.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">Actionable Insight (Coming Soon)</h4>
                <p className="text-amber-700 text-sm mt-1">
                  "75% of negative reviews for this item mentioned it was too salty. Recommending a recipe adjustment."
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
