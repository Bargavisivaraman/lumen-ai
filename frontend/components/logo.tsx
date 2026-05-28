import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent via-accent-deep to-plasma flex items-center justify-center shadow-glow">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink-950" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v6c0 5 3.5 8 9 9 5.5-1 9-4 9-9V7l-9-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          </svg>
        </div>
      </div>
      <span className="font-display text-xl tracking-tight text-ink-50">
        Lumen<span className="text-accent">·</span>AI
      </span>
    </div>
  );
}
