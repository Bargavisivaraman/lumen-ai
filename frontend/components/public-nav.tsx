"use client";

import Link from "next/link";
import { Logo } from "./logo";

export function PublicNav() {
  return (
    <header className="relative z-10 px-6 lg:px-12 py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-300">
          <a href="#features" className="hover:text-ink-50 transition">Features</a>
          <a href="#how" className="hover:text-ink-50 transition">How it works</a>
          <a href="#pricing" className="hover:text-ink-50 transition">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-ink-200 hover:text-ink-50">
            Log in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
