import { InferenceRun } from '@/types/inference';

interface RunHistoryProps {
  runs: InferenceRun[];
}

function formatDate(iso?: string) {
  if (!iso) return 'N/A';
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? iso : dt.toLocaleString();
}

export function RunHistory({ runs }: RunHistoryProps) {
  if (runs.length === 0) {
    return null;
  }

  return (
    <section className="bg-card border border-border industrial-border p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Recent Inspection Runs</h3>
        <p className="data-mono text-xs text-muted-foreground">
          Live from backend outputs/runs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 pr-4">Run</th>
              <th className="text-left py-2 pr-4">Time</th>
              <th className="text-left py-2 pr-4">Verdict</th>
              <th className="text-left py-2 pr-4">Probability</th>
              <th className="text-left py-2 pr-4">Mask Coverage</th>
              <th className="text-left py-2 pr-4">Latency</th>
              <th className="text-left py-2">Artifact</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.run_id} className="border-b border-border/60">
                <td className="py-2 pr-4 data-mono text-xs">{run.run_id}</td>
                <td className="py-2 pr-4">{formatDate(run.created_at)}</td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      run.verdict === 'CRACK'
                        ? 'text-red-300 data-mono'
                        : 'text-emerald-300 data-mono'
                    }
                  >
                    {run.verdict}
                  </span>
                </td>
                <td className="py-2 pr-4 data-mono">{(run.crack_prob * 100).toFixed(1)}%</td>
                <td className="py-2 pr-4 data-mono">{run.mask_coverage_pct.toFixed(2)}%</td>
                <td className="py-2 pr-4 data-mono">{run.latency_ms.toFixed(1)} ms</td>
                <td className="py-2">
                  {run.artifacts?.metadata_url ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${run.artifacts.metadata_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      metadata.json
                    </a>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
