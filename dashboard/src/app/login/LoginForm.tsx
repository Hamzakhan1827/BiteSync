'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, ShieldAlert, X } from 'lucide-react'
import { login } from './actions'

export default function LoginForm({ error }: { error?: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showError, setShowError] = useState(!!error)

  useEffect(() => {
    if (error) {
      setShowError(true)
      const t = setTimeout(() => setShowError(false), 6000)
      return () => clearTimeout(t)
    }
  }, [error])

  return (
    <>
      {/* Error popup — top of card, auto-dismisses after 6s */}
      {showError && error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl shadow-sm">
          <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Invalid credentials</p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Please check your email and password and try again.</p>
          </div>
          <button onClick={() => setShowError(false)} className="text-red-400 hover:text-red-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form action={login} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full px-4 py-3 pr-12 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
          >
            Sign In to Dashboard
          </button>
        </div>
      </form>
    </>
  )
}
