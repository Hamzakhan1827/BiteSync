import { login } from './actions'
import { Utensils, ShieldAlert } from 'lucide-react'

export default function LoginPage({ searchParams }: { searchParams: { error: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
              <Utensils className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-2">BiteSync Admin</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Sign in to manage your restaurant data</p>

          {searchParams?.error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>{searchParams.error}</p>
            </div>
          )}

          <form action={login} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="admin@restaurant.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-3 pt-2">
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
              >
                Sign In to Dashboard
              </button>
            </div>
          </form>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-200 dark:border-slate-800 text-center transition-colors">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account? <a href="#" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Contact BiteSync Sales</a>
          </p>
        </div>
      </div>
    </div>
  )
}
