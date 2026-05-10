"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingDown, Star, Users, Settings } from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: TrendingDown },
  { name: "Feedback Hub", href: "/feedback", icon: Star },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 px-3">
      {navItems.map(({ name, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold transition-all w-[232px] ${
              active
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div className="relative shrink-0">
              <Icon className={`w-5 h-5 ${active ? "text-emerald-500" : ""}`} />
              {active && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
