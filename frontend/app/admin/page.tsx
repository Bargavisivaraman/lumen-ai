"use client";

import { useEffect, useState } from "react";
import { Users, MessageSquare, Brain, Clock, TrendingUp, Shield } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { api, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatDate, minutesToHours } from "@/lib/utils";

export default function AdminPage() {
  return (
    <AppShell>
      <AdminInner />
    </AppShell>
  );
}

interface Stats {
  total_users: number;
  total_chat_messages: number;
  total_quiz_attempts: number;
  total_study_minutes: number;
  average_quiz_score: number;
}

function AdminInner() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    api.adminStats().then(setStats).catch(() => toast.error("Could not load stats"));
    api.adminUsers().then(setUsers).catch(() => {});
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <div className="px-6 lg:px-12 py-16 max-w-3xl mx-auto text-center">
        <Shield className="h-12 w-12 text-ink-400 mx-auto mb-4" />
        <h1 className="font-display text-3xl text-ink-50 mb-2">Restricted area</h1>
        <p className="text-ink-300">You need an admin account to view this page.</p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-12 py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Monitor activity, users, and engagement across the platform."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Users" value={stats?.total_users ?? "..."} icon={Users} accent="accent" />
        <StatCard label="Chat messages" value={stats?.total_chat_messages ?? "..."} icon={MessageSquare} accent="plasma" />
        <StatCard label="Quiz attempts" value={stats?.total_quiz_attempts ?? "..."} icon={Brain} accent="good" />
        <StatCard
          label="Total study time"
          value={stats ? minutesToHours(stats.total_study_minutes) : "..."}
          icon={Clock}
          accent="warn"
        />
        <StatCard
          label="Avg quiz score"
          value={stats ? `${stats.average_quiz_score}%` : "..."}
          icon={TrendingUp}
          accent="good"
        />
      </div>

      <div className="card">
        <h2 className="font-display text-lg text-ink-50 mb-5">All users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-400 border-b border-white/[0.06]">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 text-ink-100">{u.full_name}</td>
                  <td className="py-3 pr-4 text-ink-300">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="chip capitalize">{u.role}</span>
                  </td>
                  <td className="py-3 pr-4 text-ink-400">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-ink-400 py-8 text-sm">No users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
