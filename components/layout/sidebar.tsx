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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Programs & Treks", href: "/programs", icon: Compass },
  { name: "Highlights", href: "/highlights", icon: Star },
  { name: "Reviews & Awards", href: "/reviews", icon: MessageSquareQuote },
  { name: "News & Stories", href: "/news", icon: Newspaper },
  { name: "FAQs", href: "/faqs", icon: HelpCircle },
  { name: "Popovers & Widgets", href: "/popovers", icon: Sliders },
  { name: "Products (Gear)", href: "/shop/products", icon: ShoppingBag },
  { name: "Inventory", href: "/shop/inventory", icon: Boxes },
  { name: "Orders", href: "/shop/orders", icon: ClipboardList },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Form Submissions", href: "/forms", icon: Inbox },
  { name: "Organization Profile", href: "/organization/profile", icon: Building },
];

export function Sidebar() {
  const pathname = usePathname();
  const { organization } = useAuth();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-border flex items-center px-6 gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
          <Mountain className="h-5 w-5" />
        </div>
        <div className="truncate">
          <h1 className="font-bold text-sm leading-tight tracking-tight truncate">
            {organization?.name || "Rope4"}
          </h1>
          <p className="text-[11px] text-muted-foreground truncate">Admin Console</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
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
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tenant / User Info Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Rope4 v1.0 MVP</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
      </div>
    </aside>
  );
}
