"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  CalendarRange,
  Brain,
  FileText,
  BarChart3,
  Mic,
  Sparkles,
} from "lucide-react";
import { PublicNav } from "@/components/public-nav";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Tutor that actually teaches",
    body: "Step-by-step explanations, follow-ups, examples. Adapts to your level on every message.",
  },
  {
    icon: CalendarRange,
    title: "Plans that fit your week",
    body: "Tell it your subjects, hours, and exam date. Get a balanced schedule tilted toward your weak spots.",
  },
  {
    icon: Brain,
    title: "Quizzes from any topic",
    body: "Generate adaptive multiple-choice sets, get instant feedback, track which topics need another pass.",
  },
  {
    icon: FileText,
    title: "Notes you can actually use",
    body: "Drop in a PDF or paste your class notes. Get a summary, key points, and flashcards in seconds.",
  },
  {
    icon: BarChart3,
    title: "Honest analytics",
    body: "Streaks, weak areas, time-per-subject. The dashboard tells you where you really stand.",
  },
  {
    icon: Mic,
    title: "Voice + text",
    body: "Speak your question, hear the answer. Hands-free study while you walk, cook, or commute.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sign in",
    body: "Free account. Your data stays yours.",
  },
  {
    n: "02",
    title: "Tell us what you're studying",
    body: "Subjects, goals, exam date, weak spots, hours per day.",
  },
  {
    n: "03",
    title: "Get a plan and a tutor",
    body: "Daily schedule, AI chat, quizzes, and notes — all in one place.",
  },
  {
    n: "04",
    title: "Improve, visibly",
    body: "Track progress, retake weak topics, watch scores climb.",
  },
];

export default function Landing() {
  return (
    <>
      <PublicNav />

      {/* HERO */}
      <section className="relative px-6 lg:px-12 pt-12 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-50 [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_30%,black_30%,transparent_80%)] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-ink-200 mb-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Open source · built for students</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]"
            >
              <span className="text-ink-50">A patient tutor</span>{" "}
              <em className="italic text-ink-300">that knows</em>{" "}
              <span className="gradient-text">exactly where you're stuck.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 max-w-xl text-lg text-ink-300 leading-relaxed"
            >
              Lumen is a virtual teaching assistant that talks you through hard concepts,
              builds a personalized study plan, quizzes you on weak areas, and turns your own
              notes into flashcards. One app. Everything an actual tutor would do.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link href="/register" className="btn-primary group">
                Start learning free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className="btn-ghost">Log in</Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex items-center gap-6 text-xs text-ink-400"
            >
              <div>
                <div className="text-ink-50 font-display text-2xl">Free</div>
                <div>forever for students</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-ink-50 font-display text-2xl">Open</div>
                <div>source · self-hostable</div>
              </div>
            </motion.div>
          </div>

          {/* Hero visual — abstract chat preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-plasma/20 via-transparent to-accent/20 blur-3xl" />
            <div className="relative glass-strong rounded-3xl p-6 shadow-plasma">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-signal-bad" />
                <div className="h-2.5 w-2.5 rounded-full bg-signal-warn" />
                <div className="h-2.5 w-2.5 rounded-full bg-signal-good" />
                <span className="ml-3 text-xs text-ink-400">lumen.ai · tutor</span>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-accent text-ink-950 px-4 py-3 text-sm"
                >
                  Why does multiplying two negatives give a positive?
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm text-ink-100"
                >
                  Great question. Think of a negative as "reversing direction." So{" "}
                  <span className="text-accent">−3 × −4</span> means reverse twice — which leaves
                  you facing forward. That's why the answer is{" "}
                  <span className="text-accent">+12</span>.
                  <div className="mt-2 text-xs text-ink-400">Want a number-line example next?</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="flex items-center gap-2 text-xs text-ink-400 pt-2"
                >
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  Tutor is thinking...
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative px-6 lg:px-12 py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent mb-3">
              What you get
            </div>
            <h2 className="font-display text-4xl lg:text-5xl tracking-tight">
              Six tools.{" "}
              <em className="italic text-ink-300">One</em> learning loop.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-ink-950 p-8 hover:bg-white/[0.02] transition group"
                >
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:border-accent/40 transition">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-display text-xl text-ink-50 mb-2">{f.title}</h3>
                  <p className="text-sm text-ink-300 leading-relaxed">{f.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative px-6 lg:px-12 py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl mb-16">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent mb-3">
              How it works
            </div>
            <h2 className="font-display text-4xl lg:text-5xl tracking-tight">
              Four steps from{" "}
              <em className="italic text-ink-300">"I'm lost"</em> to{" "}
              <span className="gradient-text">"I've got this"</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card"
              >
                <div className="font-display text-3xl text-accent mb-4">{s.n}</div>
                <h3 className="text-ink-50 font-medium mb-2">{s.title}</h3>
                <p className="text-sm text-ink-300">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 lg:px-12 py-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl lg:text-6xl tracking-tight leading-[1.05] mb-8">
            Your <em className="italic text-ink-300">next</em> study session{" "}
            <span className="gradient-text">starts now.</span>
          </h2>
          <p className="text-ink-300 text-lg mb-10 max-w-xl mx-auto">
            Sign up, paste in what you're learning, and get a personalized plan in under a minute.
          </p>
          <Link href="/register" className="btn-primary text-base px-7 py-3.5">
            Create free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] px-6 lg:px-12 py-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-400">
          <div>© {new Date().getFullYear()} Lumen AI · Built for students.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-ink-100">Privacy</a>
            <a href="#" className="hover:text-ink-100">Terms</a>
            <a href="#" className="hover:text-ink-100">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}