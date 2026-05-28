export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        {eyebrow && (
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl text-ink-50 tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-sm text-ink-300 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
