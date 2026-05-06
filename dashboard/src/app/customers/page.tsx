import { Header } from '@/components/Header'
import { Users } from 'lucide-react'

export default function CustomersPage() {
  return (
    <>
      <Header title="Customer Directory" />
      <main className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center text-slate-500 dark:text-slate-400 max-w-md">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Customer Intelligence</h2>
          <p>This page will list your VIP returning customers, showing exactly what they order every time so you can personalize their experience.</p>
        </div>
      </main>
    </>
  )
}
