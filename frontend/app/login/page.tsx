"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-store";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, user, initialized, init } = useAuth();
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
    try {
      await login(email, password);
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed";
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
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
              Welcome <em className="italic text-ink-300">back</em>
            </h1>
            <p className="text-ink-300 mb-10">Pick up where you left off.</p>

            <form onSubmit={onSubmit} className="space-y-5">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-8 text-sm text-ink-300 text-center">
              New here?{" "}
              <Link href="/register" className="text-accent hover:text-accent-soft">
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-l border-white/[0.06]">
        <div className="absolute inset-0 bg-grid-lines opacity-30 [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-plasma/15 via-transparent to-accent/10" />
        <div className="relative m-auto max-w-md p-10">
          <blockquote className="font-display text-3xl text-ink-50 leading-snug">
            "I went from a C+ to an A− in one semester. The plan is what actually changed things."
          </blockquote>
          <div className="mt-6 text-sm text-ink-300">— Maya, sophomore CS major</div>
        </div>
      </div>
    </div>
  );
}
