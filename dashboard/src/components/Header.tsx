"use client";

import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header({ title }: { title: string }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Analytics", href: "/" },
    { name: "Menu Manager", href: "/menu" },
  ];

  return (
    <header className="h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-[90] transition-colors">
      <div className="flex items-center gap-6">
        <span
          className="font-bold text-slate-900 dark:text-slate-200"
          style={{ fontFamily: 'Inter, "Helvetica Neue", system-ui, sans-serif', fontSize: 24, letterSpacing: '-0.02em' }}
        >
          Bite<span style={{ color: '#10b981' }}>Sync</span>
        </span>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

        <nav className="hidden md:flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  )
}
