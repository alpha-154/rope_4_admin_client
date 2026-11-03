"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Bell, LogOut, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, organization, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Staff User";

  return (
    <header className="h-16 border-b border-border bg-card/70 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          Organization:{" "}
          <strong className="text-foreground font-semibold">
            {organization?.name || "Rope4 Outdoor Education"}
          </strong>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* User Card */}
        <div className="flex items-center gap-3 pl-1">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
            {user?.firstName ? user.firstName.charAt(0) : "A"}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight text-foreground">
              {displayName}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
              {user?.role || "Staff"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 ml-2 p-1.5 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            title="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
