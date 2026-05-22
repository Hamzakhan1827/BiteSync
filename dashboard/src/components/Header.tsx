"use client";

import { ThemeToggle } from "./ThemeToggle";

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-[90] transition-colors">
      <h1 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{title}</h1>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
