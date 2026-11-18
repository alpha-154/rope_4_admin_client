"use client";

import { Bell, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { organization } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0 relative z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Organization Badge & Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 font-medium">Org:</span>
          <strong className="text-slate-900 font-semibold truncate max-w-[180px]">
            {organization?.name || "Rope4 Outdoor Education"}
          </strong>
        </div>

        {/* Global Search Bar with keyboard shortcut tag (Ctrl+K) */}
        <div className="relative hidden md:flex items-center w-64 lg:w-72">
          <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search console..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          className="relative h-9 w-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

      </div>
    </header>
  );
}
