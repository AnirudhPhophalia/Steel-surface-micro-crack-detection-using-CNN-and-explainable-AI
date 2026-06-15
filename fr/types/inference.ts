/**
 * Real API response interface matching FastAPI backend
 */
export interface InferenceResult {
  verdict: "CRACK" | "OK";
  crack_prob: number; // 0..1, multiply by 100 for display
  mask_coverage_pct: number; // already a percent (0..100)
  mask_png_b64: string; // raw base64 — render as `data:image/png;base64,${...}`
  latency_ms: number;
  cascade_triggered: boolean;
}

export interface InferenceRunArtifacts {
  original_url?: string;
  mask_url?: string;
  metadata_url?: string;
}

export interface InferenceRun {
  run_id: string;
  created_at?: string;
  verdict: "CRACK" | "OK";
  crack_prob: number;
  mask_coverage_pct: number;
  latency_ms: number;
  cascade_triggered: boolean;
  artifacts?: InferenceRunArtifacts;
}
