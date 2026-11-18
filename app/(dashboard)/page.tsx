"use client";

import {
  Compass,
  ShoppingBag,
  ClipboardList,
  Inbox,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface PeriodComparison {
  current: number;
  previous: number;
  changePercent: number | null;
}

interface DashboardStats {
  periodDays: number;
  programs: { active: number; total: number; created: PeriodComparison };
  products: {
    total: number;
    published: number;
    lowStock: number;
    outOfStock: number;
    created: PeriodComparison;
  };
  orders: { placed: PeriodComparison; revenue: number; pending: number };
  inquiries: { received: PeriodComparison; unread: number };
  system: {
    database: string;
    uptimeSeconds: number;
    environment: string;
    organizationName: string;
    organizationSlug: string;
    websiteUrl: string;
    generatedAt: string;
  };
}

type Tone = "up" | "down" | "neutral" | "warning";

interface StatCard {
  title: string;
  value: string;
  change: string;
  tone: Tone;
  caption: string;
  icon: LucideIcon;
  href: string;
}

const nf = new Intl.NumberFormat("en-US");

function comparisonLabel(
  c: PeriodComparison,
  days: number
): { text: string; tone: Tone } {
  if (c.changePercent === null) {
    return c.current > 0
      ? {
          text: `+${nf.format(c.current)} vs previous ${days} days`,
          tone: "up",
        }
      : { text: `No activity in ${days} days`, tone: "neutral" };
  }
  if (c.changePercent > 0) {
    return {
      text: `+${c.changePercent}% vs previous ${days} days`,
      tone: "up",
    };
  }
  if (c.changePercent < 0) {
    return {
      text: `${c.changePercent}% vs previous ${days} days`,
      tone: "down",
    };
  }
  return { text: `No change vs previous ${days} days`, tone: "neutral" };
}

function buildCards(s: DashboardStats): StatCard[] {
  const d = s.periodDays;
  const newPrograms = s.programs.created.current;
  const stockIssues = s.products.lowStock + s.products.outOfStock;
  const orders = comparisonLabel(s.orders.placed, d);

  return [
    {
      title: "Active Programs",
      value: nf.format(s.programs.active),
      change:
        newPrograms > 0
          ? `+${nf.format(newPrograms)} in last ${d} days`
          : `No new programs in ${d} days`,
      tone: newPrograms > 0 ? "up" : "neutral",
      caption: `${nf.format(s.programs.total)} total incl. drafts & archived`,
      icon: Compass,
      href: "/programs",
    },
    {
      title: "Store Products",
      value: nf.format(s.products.total),
      change:
        stockIssues > 0
          ? [
              s.products.lowStock > 0
                ? `${nf.format(s.products.lowStock)} low stock`
                : null,
              s.products.outOfStock > 0
                ? `${nf.format(s.products.outOfStock)} out of stock`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")
          : "All items in stock",
      tone: stockIssues > 0 ? "warning" : "up",
      caption: `${nf.format(s.products.published)} published`,
      icon: ShoppingBag,
      href: "/products",
    },
    {
      title: "Recent Orders",
      value: nf.format(s.orders.placed.current),
      change: orders.text,
      tone: orders.tone,
      caption: `Last ${d} days · ৳${nf.format(Math.round(s.orders.revenue))} revenue · ${nf.format(s.orders.pending)} pending`,
      icon: ClipboardList,
      href: "/orders",
    },
    {
      title: "New Inquiries",
      value: nf.format(s.inquiries.received.current),
      change:
        s.inquiries.unread > 0
          ? `${nf.format(s.inquiries.unread)} unread`
          : "All caught up",
      tone: s.inquiries.unread > 0 ? "warning" : "up",
      caption: `Last ${d} days · ${comparisonLabel(s.inquiries.received, d).text}`,
      icon: Inbox,
      href: "/forms",
    },
  ];
}

const TONE_STYLES: Record<Tone, { className: string; Icon: LucideIcon }> = {
  up: {
    className: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
    Icon: TrendingUp,
  },
  down: {
    className: "text-rose-700 bg-rose-50 border-rose-200/80",
    Icon: TrendingDown,
  },
  neutral: {
    className: "text-slate-600 bg-slate-50 border-slate-200/80",
    Icon: Minus,
  },
  warning: {
    className: "text-amber-700 bg-amber-50 border-amber-200/80",
    Icon: AlertTriangle,
  },
};

function formatUptime(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function DashboardPage() {
  const { organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get("/admin/dashboard/stats");
      setStats(res.data?.data ?? null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Could not reach the backend API"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = stats ? buildCards(stats) : null;
  const apiUrl = apiClient.defaults.baseURL || "";
  const dbConnected = stats?.system.database === "connected";
  const status = error
    ? {
        label: "Offline",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      }
    : !stats
      ? {
          label: "Checking…",
          className: "bg-slate-50 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        }
      : dbConnected
        ? {
            label: "Operational",
            className: "bg-emerald-50 text-emerald-700 border-emerald-200",
            dot: "bg-emerald-500",
          }
        : {
            label: "Degraded",
            className: "bg-amber-50 text-amber-700 border-amber-200",
            dot: "bg-amber-500",
          };

  const orgName = stats?.system.organizationName || organization?.name || "—";
  const orgSlug = stats?.system.organizationSlug || organization?.slug;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to the Rope4 Management Console. Monitor outdoor adventure
            programs, gear inventory, orders, and inquiries.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-700">
          Failed to load dashboard statistics: {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards
          ? cards.map((stat) => {
              const Icon = stat.icon;
              const tone = TONE_STYLES[stat.tone];
              return (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {stat.title}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold text-slate-900">
                      {stat.value}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold mt-1.5">
                      <span
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded-md border",
                          tone.className
                        )}
                      >
                        <tone.Icon className="h-3 w-3 shrink-0" />
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                      {stat.caption}
                    </p>
                  </div>
                </Link>
              );
            })
          : Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm"
              >
                <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
                <div className="mt-6 h-8 w-16 rounded bg-slate-100 animate-pulse" />
                <div className="mt-3 h-4 w-36 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
      </div>

      {/* Quick Action & System Status Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              Quick Actions
            </h2>
            <span className="text-xs text-slate-400">Common workflows</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/programs/create", label: "New Program" },
              { href: "/products", label: "Add Product" },
              { href: "/news/create", label: "Write Story" },
              { href: "/faqs", label: "Add FAQ" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors shadow-2xs group"
              >
                <span>{a.label}</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              System Status
            </h2>
            <span
              className={cn(
                "text-xs px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1.5",
                status.className
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  status.dot
                )}
              />
              {status.label}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center gap-3 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Backend API</span>
              <span className="font-mono text-xs text-slate-700 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 truncate">
                {apiUrl}
              </span>
            </div>
            <div className="flex justify-between items-center gap-3 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Database</span>
              <span
                className={cn(
                  "font-semibold capitalize",
                  stats
                    ? dbConnected
                      ? "text-emerald-700"
                      : "text-amber-700"
                    : "text-slate-400"
                )}
              >
                {stats?.system.database ?? (error ? "unreachable" : "…")}
              </span>
            </div>
            <div className="flex justify-between items-center gap-3 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">
                Active Organization
              </span>
              <span className="font-semibold text-slate-900 text-right truncate">
                {orgName}
                {orgSlug && (
                  <span className="ml-1.5 font-mono font-normal text-slate-400">
                    /{orgSlug}
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center gap-3 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">
                Public Storefront
              </span>
              {stats?.system.websiteUrl ? (
                <a
                  href={stats.system.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-slate-700 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 hover:text-emerald-700 hover:border-emerald-200 truncate"
                >
                  {stats.system.websiteUrl}
                </a>
              ) : (
                <span className="text-slate-400">…</span>
              )}
            </div>
            <div className="flex justify-between items-center gap-3 py-2">
              <span className="text-slate-500 font-medium">
                API Uptime · Environment
              </span>
              <span className="font-medium text-slate-700">
                {stats ? (
                  <>
                    {formatUptime(stats.system.uptimeSeconds)}
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                      {stats.system.environment}
                    </span>
                  </>
                ) : (
                  "…"
                )}
              </span>
            </div>
            {stats && (
              <p className="pt-1 text-[11px] text-slate-400 text-right">
                Updated{" "}
                {new Date(stats.system.generatedAt).toLocaleTimeString("en-US")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
