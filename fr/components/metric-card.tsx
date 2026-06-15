interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'default' | 'success' | 'danger';
}

export function MetricCard({ label, value, unit, variant = 'default' }: MetricCardProps) {
  const bgColor =
    variant === 'success'
      ? 'bg-emerald-950'
      : variant === 'danger'
        ? 'bg-red-950'
        : 'bg-card';

  return (
    <div className={`${bgColor} border border-border industrial-border p-4`}>
      <p className="metric-label">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-mono text-3xl font-bold text-primary">
          {value}
        </p>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
