"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Star,
  MessageSquareQuote,
  Newspaper,
  HelpCircle,
  Sliders,
  ShoppingBag,
  Boxes,
  ClipboardList,
  Users,
  Inbox,
  Building,
  Mountain,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "NAVIGATION",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "ADVENTURE & CONTENT",
    items: [
      { name: "Programs & Treks", href: "/programs", icon: Compass },
      { name: "Highlights", href: "/highlights", icon: Star },
      { name: "Reviews & Awards", href: "/reviews", icon: MessageSquareQuote },
      { name: "News & Stories", href: "/news", icon: Newspaper },
      { name: "FAQs", href: "/faqs", icon: HelpCircle },
      { name: "Popovers & Widgets", href: "/popovers", icon: Sliders },
    ],
  },
  {
    title: "COMMERCE & CRM",
    items: [
      { name: "Products (Gear)", href: "/products", icon: ShoppingBag },
      { name: "Inventory", href: "/inventory", icon: Boxes },
      { name: "Orders", href: "/orders", icon: ClipboardList },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Form Submissions", href: "/forms", icon: Inbox },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      { name: "Site Settings", href: "/settings", icon: Settings },
      {
        name: "Organization Profile",
        href: "/organization/profile",
        icon: Building,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { organization, user, logout } = useAuth();

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "Administrator";

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col h-screen select-none shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-5 bg-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
            <Mountain className="h-5 w-5" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-sm leading-tight text-slate-900 tracking-tight truncate">
              {organization?.name || "Rope4"}
            </h1>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              Admin Console
            </p>
          </div>
        </Link>
        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          v1.0
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </p>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group",
                      isActive
                        ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-emerald-700"
                          : "text-slate-400 group-hover:text-slate-700"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Tenant / User Info Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="capitalize">{user?.role || "superAdmin"}</span>
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
