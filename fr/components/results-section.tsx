import { InferenceResult } from '@/types/inference';
import { VerdictBanner } from './verdict-banner';
import { MetricCard } from './metric-card';

interface ResultsSectionProps {
  results: InferenceResult;
  previewUrl: string;
}

export function ResultsSection({ results, previewUrl }: ResultsSectionProps) {
  const maskImageSrc = `data:image/png;base64,${results.mask_png_b64}`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Verdict Banner */}
      <VerdictBanner results={results} />

      {/* Image Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Original Plate */}
        <div className="bg-card border border-border industrial-border p-4">
          <img
            src={previewUrl}
            alt="Original steel plate"
            className="w-full h-64 object-cover bg-background"
          />
          <p className="data-mono text-xs mt-3 text-muted-foreground">
            Original Plate
          </p>
        </div>

        {/* Stage-2 U-Net Mask */}
        <div className="bg-card border border-border industrial-border p-4">
          <img
            src={maskImageSrc}
            alt="U-Net segmentation mask"
            className="w-full h-64 object-cover bg-background"
          />
          <p className="data-mono text-xs mt-3 text-muted-foreground">
            Stage-2 U-Net Mask
          </p>
        </div>

        {/* Grad-CAM Placeholder */}
        <div className="bg-card border border-border industrial-border p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl text-muted-foreground mb-2">↳</p>
            <p className="data-mono text-xs text-muted-foreground">
              Grad-CAM (Coming Soon)
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Crack Probability"
          value={(results.crack_prob * 100).toFixed(1)}
          unit="%"
        />
        <MetricCard
          label="Mask Coverage"
          value={results.mask_coverage_pct.toFixed(2)}
          unit="%"
        />
        <MetricCard
          label="Latency"
          value={results.latency_ms.toFixed(1)}
          unit="ms"
        />
        <MetricCard
          label="Cascade Triggered"
          value={results.cascade_triggered ? 'Yes' : 'No'}
          variant={results.cascade_triggered ? 'danger' : 'success'}
        />
      </div>
    </div>
  );
}
