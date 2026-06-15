# API Mock Data — For Testing Without FastAPI

If you want to test the frontend **before** your FastAPI backend is ready, you can temporarily modify `utils/api.ts` to return mock data.

## Mock Response (for testing)

```typescript
// Mock InferenceResult for testing
export const MOCK_RESULT: InferenceResult = {
  verdict: "CRACK",
  crack_prob: 0.87,
  mask_coverage_pct: 4.32,
  mask_png_b64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", // 1x1 gray pixel
  latency_ms: 10.05,
  cascade_triggered: true,
};
```

## Temporary Testing Code

Replace the `predict()` function in `utils/api.ts` with:

```typescript
export async function predict(file: File): Promise<InferenceResult> {
  // MOCK: Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock result
  return MOCK_RESULT;
}
```

## Restoring Live API

Once your FastAPI is running, revert to the original `predict()` function:

```typescript
export async function predict(file: File): Promise<InferenceResult> {
  const fd = new FormData();
  fd.append("file", file);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      body: fd,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
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
```

## Sample Base64 Images for mask_png_b64

Here are some short base64 strings you can use for quick testing:

### Solid Red 1x1 pixel (for "crack detected" demo)
```
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNQD/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=
```

### Solid Blue 1x1 pixel (for "no crack" demo)
```
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNQD/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=
```

Use the longer base64 strings from your actual U-Net mask generation, or provide real PNG outputs from your backend.

---

## Testing Flow

1. **With Mock Data:**
   - Upload any image
   - Click "Run Inspection"
   - See mock verdict/metrics instantly
   - Verify UI layout before API integration

2. **With Live FastAPI:**
   - Revert `predict()` to live version
   - Start `uvicorn api:app --reload`
   - Test with real inference results

---

This file is for **development only**. Remove mock code before production deployment.
