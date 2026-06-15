import { InferenceResult, InferenceRun } from "@/types/inference";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type PredictOptions = {
  crackThreshold: number;
  maskThreshold: number;
};

export async function predict(file: File, options: PredictOptions): Promise<InferenceResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("crack_threshold", options.crackThreshold.toString());
  fd.append("mask_threshold", options.maskThreshold.toString());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: fd,
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail = "";
      try {
        const payload = await res.json();
        detail = payload?.detail ? ` - ${payload.detail}` : "";
      } catch {
        // Ignore JSON parsing errors and fall back to status text.
      }
      throw new Error(`API error: ${res.status} ${res.statusText}${detail}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("API request timeout (30s)");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function listRuns(limit = 20): Promise<InferenceRun[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE}/runs?limit=${limit}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}
