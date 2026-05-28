"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarRange,
  BarChart3,
  Brain,
  FileText,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Tutor", icon: MessageSquare },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/quiz", label: "Quizzes", icon: Brain },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-ink-950/50 backdrop-blur-xl">
      <div className="px-6 py-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-white/[0.06] text-ink-50 shadow-glass"
                  : "text-ink-300 hover:text-ink-50 hover:bg-white/[0.03]",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-accent")} />
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all mt-4",
              pathname.startsWith("/admin")
                ? "bg-plasma/10 text-plasma-soft border border-plasma/20"
                : "text-ink-300 hover:text-ink-50 hover:bg-white/[0.03]",
            )}
          >
            <Shield className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-white/[0.06]">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-plasma flex items-center justify-center text-ink-950 text-sm font-semibold">
            {user?.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-ink-100 truncate">{user?.full_name}</div>
            <div className="text-xs text-ink-400 truncate">{user?.email}</div>
          </div>
          <Settings className="h-4 w-4 text-ink-400" />
        </Link>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:text-signal-bad hover:bg-white/[0.03] transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
