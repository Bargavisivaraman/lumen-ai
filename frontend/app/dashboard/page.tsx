"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  Trophy,
  Brain,
  ArrowRight,
  Sparkles,
  CalendarRange,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { api, type AnalyticsSummary, type Recommendation, type StudyPlan } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { minutesToHours, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardInner />
    </AppShell>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  useEffect(() => {
    api.dashboard().then(setStats).catch(() => {});
    api.recommendations().then(setRecs).catch(() => {});
    api.latestPlan().then(setPlan).catch(() => {});
  }, []);

  const todayBlocks = plan?.payload.days[0]?.blocks ?? [];
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="px-6 lg:px-12 py-10 max-w-7xl mx-auto">
      <PageHeader
        eyebrow={`Welcome back, ${firstName}`}
        title="Your learning dashboard"
        description="Here's where you stand today, and what to focus on next."
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Study streak"
          value={`${stats?.current_streak_days ?? 0}d`}
          hint={stats?.current_streak_days ? "Keep it going" : "Log a session today"}
          icon={Flame}
          accent="warn"
        />
        <StatCard
          label="Total studied"
          value={minutesToHours(stats?.total_study_minutes ?? 0)}
          hint={`${stats?.sessions_this_week ?? 0} sessions this week`}
          icon={Clock}
          accent="accent"
        />
        <StatCard
          label="Avg quiz score"
          value={`${stats?.average_quiz_score ?? 0}%`}
          hint={`${stats?.quizzes_taken ?? 0} quizzes taken`}
          icon={Trophy}
          accent="good"
        />
        <StatCard
          label="Weak topics"
          value={stats?.weak_topics.length ?? 0}
          hint={stats?.weak_topics[0] ?? "None identified yet"}
          icon={Brain}
          accent="plasma"
        />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Today's plan */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-ink-50">Today's plan</h2>
            <Link
              href="/planner"
              className="text-xs text-accent hover:text-accent-soft inline-flex items-center gap-1"
            >
              View full plan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {todayBlocks.length === 0 ? (
            <div className="text-center py-10">
              <CalendarRange className="h-8 w-8 text-ink-400 mx-auto mb-3" />
              <p className="text-sm text-ink-300 mb-4">No plan yet — create one in 30 seconds.</p>
              <Link href="/planner" className="btn-primary">
                Generate a study plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBlocks.map((block, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-plasma/20 border border-white/[0.06] flex items-center justify-center text-accent font-display text-lg">
                    {block.minutes}
                    <span className="text-xs">m</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="chip">{block.subject}</span>
                    </div>
                    <h3 className="text-ink-50 font-medium">{block.topic}</h3>
                    {block.notes && (
                      <p className="text-xs text-ink-400 mt-1">{block.notes}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="font-display text-xl text-ink-50">For you</h2>
          </div>

          {recs.length === 0 ? (
            <p className="text-sm text-ink-300">Get started below — recommendations will appear here as you learn.</p>
          ) : (
            <div className="space-y-3">
              {recs.slice(0, 4).map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={r.action_url ?? "#"}
                    className="block rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-accent/30 hover:bg-white/[0.04] transition group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wider text-accent mb-1">
                          {r.kind}
                        </div>
                        <h3 className="text-sm text-ink-50 font-medium mb-1">{r.title}</h3>
                        <p className="text-xs text-ink-400">{r.reason}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-accent shrink-0 mt-1 transition" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions strip */}
      {stats?.suggestions && stats.suggestions.length > 0 && (
        <div className="mt-6 card bg-gradient-to-br from-plasma/[0.08] via-transparent to-accent/[0.04] border-plasma/[0.15]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-plasma-soft" />
            <h3 className="font-display text-lg text-ink-50">AI coach tips</h3>
          </div>
          <ul className="grid sm:grid-cols-3 gap-3">
            {stats.suggestions.map((tip, i) => (
              <li key={i} className="text-sm text-ink-200 flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-plasma-soft shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <QuickAction
          href="/chat"
          icon={MessageSquare}
          title="Ask the tutor"
          description="Got a concept that isn't clicking? Talk it through."
        />
        <QuickAction
          href="/quiz"
          icon={Brain}
          title="Take a quick quiz"
          description="5 questions on any topic. Instant feedback."
        />
        <QuickAction
          href="/notes"
          icon={Sparkles}
          title="Summarize notes"
          description="Upload a PDF, get flashcards and a summary."
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card group hover:border-accent/30 transition flex flex-col items-start"
    >
      <Icon className="h-5 w-5 text-accent mb-3" />
      <h3 className="font-medium text-ink-50 mb-1">{title}</h3>
      <p className="text-xs text-ink-400">{description}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-xs text-accent group-hover:gap-2 transition-all">
        Open <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
