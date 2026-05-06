import { ThemeToggle } from "./ThemeToggle";

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">Last updated: Just now</span>
        <ThemeToggle />
      </div>
    </header>
  )
}
