import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card flex flex-col items-center text-center py-12", className)}>
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06]">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h3 className="font-display text-xl text-ink-50 mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-300 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
