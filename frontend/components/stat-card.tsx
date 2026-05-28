import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "accent",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "accent" | "plasma" | "good" | "warn" | "bad";
  className?: string;
}) {
  const colorMap = {
    accent: "text-accent",
    plasma: "text-plasma-soft",
    good: "text-signal-good",
    warn: "text-signal-warn",
    bad: "text-signal-bad",
  };

  return (
    <div className={cn("card", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</div>
        {Icon && <Icon className={cn("h-4 w-4", colorMap[accent])} />}
      </div>
      <div className={cn("font-display text-3xl tracking-tight", colorMap[accent])}>{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </div>
  );
}
