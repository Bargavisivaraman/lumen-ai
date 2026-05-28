"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-store";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, user, initialized, init } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await register(email, password, fullName);
      toast.success("Account created. Welcome!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-r border-white/[0.06]">
        <div className="absolute inset-0 bg-grid-lines opacity-30 [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-plasma/15" />
        <div className="relative m-auto max-w-md p-10">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            What's inside
          </div>
          <ul className="space-y-4 text-ink-100">
            {[
              "AI tutor that explains things step-by-step",
              "Personalized study plans based on your subjects",
              "Adaptive quizzes that target weak topics",
              "Notes → summaries + flashcards in seconds",
              "Honest analytics so you know where you stand",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 lg:px-16 py-10">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex-1 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight mb-3">
              Create your <em className="italic text-ink-300">account</em>
            </h1>
            <p className="text-ink-300 mb-10">Free. No credit card.</p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="label">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input pl-10"
                    placeholder="Alex Chen"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="you@university.edu"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? "Creating account..." : "Create account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-8 text-sm text-ink-300 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:text-accent-soft">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
