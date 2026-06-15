import { InferenceResult } from '@/types/inference';

interface VerdictBannerProps {
  results: InferenceResult;
}

export function VerdictBanner({ results }: VerdictBannerProps) {
  const isCrack = results.verdict === 'CRACK';
  const probability = (results.crack_prob * 100).toFixed(1);

  return (
    <div
      className={`w-full p-8 border border-border industrial-border animate-fade-in ${
        isCrack
          ? 'bg-red-950 text-red-100'
          : 'bg-emerald-950 text-emerald-100'
      }`}
    >
      <div className="flex items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{isCrack ? '⚠' : '✓'}</span>
          <div>
            <h2 className="text-3xl font-bold">
              {isCrack ? 'CRACK DETECTED' : 'OK — No Crack Detected'}
            </h2>
            <p className="text-sm text-opacity-75 mt-1">
              Quality verdict
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-6xl font-mono font-bold">
            {probability}%
          </div>
          <p className="data-mono text-sm opacity-75">Crack Probability</p>
        </div>
      </div>
    </div>
  );
}
