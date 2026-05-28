"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  CalendarRange,
  BarChart3,
  Brain,
  FileText,
  Settings,
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
  { href: "/profile", label: "Profile", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      <div className="lg:hidden flex items-center justify-between border-b border-white/[0.06] px-4 py-3 bg-ink-950/80 backdrop-blur-xl sticky top-0 z-30">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-white/5">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-72 bg-ink-900 border-l border-white/[0.06] lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <Logo />
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-white/[0.06] text-ink-50"
                          : "text-ink-300 hover:text-ink-50 hover:bg-white/[0.03]",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active && "text-accent")} />
                      {item.label}
                    </Link>
                  );
                })}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-plasma-soft hover:bg-white/[0.03]"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </nav>

              <div className="p-3 border-t border-white/[0.06]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:text-signal-bad hover:bg-white/[0.03] transition"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
