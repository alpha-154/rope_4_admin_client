import {
  Compass,
  ShoppingBag,
  ClipboardList,
  Inbox,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      title: "Active Programs",
      value: "14",
      change: "+2 this month",
      icon: Compass,
      href: "/programs",
    },
    {
      title: "Store Products",
      value: "38",
      change: "4 low stock",
      icon: ShoppingBag,
      href: "/shop/products",
    },
    {
      title: "Recent Orders",
      value: "128",
      change: "+18% from last week",
      icon: ClipboardList,
      href: "/shop/orders",
    },
    {
      title: "New Inquiries",
      value: "27",
      change: "6 unread",
      icon: Inbox,
      href: "/forms",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to the Rope4 Management Dashboard. Monitor programs, gear inventory, orders, and inquiries.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/programs/create"
              className="p-3 rounded-lg border border-border hover:bg-muted text-sm font-medium flex items-center justify-between transition-colors"
            >
              <span>New Program</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/shop/products/create"
              className="p-3 rounded-lg border border-border hover:bg-muted text-sm font-medium flex items-center justify-between transition-colors"
            >
              <span>Add Product</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/news/create"
              className="p-3 rounded-lg border border-border hover:bg-muted text-sm font-medium flex items-center justify-between transition-colors"
            >
              <span>Write Story</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/faqs"
              className="p-3 rounded-lg border border-border hover:bg-muted text-sm font-medium flex items-center justify-between transition-colors"
            >
              <span>Add FAQ</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">System Status</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-medium">
              Operational
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">API Connection</span>
              <span className="font-mono text-xs">http://localhost:5000/api/v1</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Active Organization</span>
              <span className="font-medium">Rope4 Outdoor Education</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Website Public URL</span>
              <span className="font-mono text-xs">http://localhost:3000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

