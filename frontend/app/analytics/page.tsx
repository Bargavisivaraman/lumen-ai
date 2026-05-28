"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Flame, Clock, Trophy, Brain, Plus, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { api, type AnalyticsSummary } from "@/lib/api";
import { minutesToHours } from "@/lib/utils";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <AnalyticsInner />
    </AppShell>
  );
}

function AnalyticsInner() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    api.dashboard().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="px-6 lg:px-12 py-10 max-w-6xl mx-auto">
        <div className="card animate-pulse h-64" />
      </div>
    );
  }

  const subjectData = Object.entries(data.by_subject_minutes).map(([name, minutes]) => ({
    name,
    minutes,
  }));

  return (
    <div className="px-6 lg:px-12 py-10 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Analytics"
        title="Your learning, in numbers"
        description="What you've actually studied, when you've studied it, and where you need more work."
        actions={
          <button onClick={() => setShowLog((v) => !v)} className="btn-ghost">
            {showLog ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showLog ? "Cancel" : "Log session"}
          </button>
        }
      />

      {showLog && <LogSessionForm onLogged={() => api.dashboard().then(setData)} />}

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Streak"
          value={`${data.current_streak_days}d`}
          hint="Consecutive study days"
          icon={Flame}
          accent="warn"
        />
        <StatCard
          label="Total studied"
          value={minutesToHours(data.total_study_minutes)}
          hint={`${data.sessions_this_week} this week`}
          icon={Clock}
          accent="accent"
        />
        <StatCard
          label="Avg quiz score"
          value={`${data.average_quiz_score}%`}
          hint={`${data.quizzes_taken} quizzes`}
          icon={Trophy}
          accent="good"
        />
        <StatCard
          label="Weak areas"
          value={data.weak_topics.length}
          hint={data.weak_topics[0] ?? "None yet"}
          icon={Brain}
          accent="plasma"
        />
      </div>

      {/* Daily minutes chart */}
      <div className="card mb-6">
        <h2 className="font-display text-lg text-ink-50 mb-1">Last 14 days</h2>
        <p className="text-xs text-ink-400 mb-5">Study minutes per day</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.daily_minutes_last_14}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8ff5e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#c8ff5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#78716c", fontSize: 11 }}
                tickFormatter={(d: string) =>
                  new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#78716c", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,13,12,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#fff",
                }}
                labelFormatter={(d) =>
                  new Date(d).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                }
                formatter={(v: number) => [`${v} min`, "Studied"]}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#c8ff5e"
                strokeWidth={2}
                fill="url(#g1)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Subject distribution */}
        <div className="card">
          <h2 className="font-display text-lg text-ink-50 mb-1">By subject</h2>
          <p className="text-xs text-ink-400 mb-5">Time spent per subject</p>
          {subjectData.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">
              Log a study session to populate this chart.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "#78716c", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#a8a29e", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,13,12,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                    }}
                    formatter={(v: number) => [`${v} min`, "Studied"]}
                  />
                  <Bar dataKey="minutes" radius={[0, 8, 8, 0]}>
                    {subjectData.map((_, i) => {
                      const colors = ["#c8ff5e", "#7c5cff", "#5eff8b", "#ffb45e", "#ff5e7e"];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weak topics */}
        <div className="card">
          <h2 className="font-display text-lg text-ink-50 mb-1">Weak topics</h2>
          <p className="text-xs text-ink-400 mb-5">Topics where your quiz scores are below 70%</p>
          {data.weak_topics.length === 0 ? (
            <p className="text-sm text-ink-400 py-8 text-center">
              Nothing flagged yet. Take a few quizzes to surface weak spots.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.weak_topics.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border border-signal-bad/20 bg-signal-bad/5 px-4 py-3"
                >
                  <span className="text-sm text-ink-100">{t}</span>
                  <a
                    href={`/quiz?topic=${encodeURIComponent(t)}`}
                    className="text-xs text-accent hover:text-accent-soft"
                  >
                    Retake →
                  </a>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* AI suggestions */}
      {data.suggestions.length > 0 && (
        <div className="card bg-gradient-to-br from-plasma/[0.08] via-transparent to-accent/[0.04] border-plasma/[0.15]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-plasma-soft" />
            <h2 className="font-display text-lg text-ink-50">AI coach</h2>
          </div>
          <ul className="grid sm:grid-cols-3 gap-3">
            {data.suggestions.map((tip, i) => (
              <li key={i} className="text-sm text-ink-200 flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-plasma-soft shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LogSessionForm({ onLogged }: { onLogged: () => void }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return toast.error("Add a subject");
    setBusy(true);
    try {
      await api.logStudySession(subject, minutes, topic || undefined);
      toast.success("Session logged");
      setSubject("");
      setTopic("");
      setMinutes(30);
      onLogged();
    } catch {
      toast.error("Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="card mb-6 grid sm:grid-cols-[2fr_2fr_1fr_auto] gap-3 items-end"
    >
      <div>
        <label className="label">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input"
          placeholder="Calculus"
        />
      </div>
      <div>
        <label className="label">Topic (optional)</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input"
          placeholder="Limits"
        />
      </div>
      <div>
        <label className="label">Minutes</label>
        <input
          type="number"
          min={1}
          max={600}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="input"
        />
      </div>
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Saving..." : "Log"}
      </button>
    </motion.form>
  );
}
