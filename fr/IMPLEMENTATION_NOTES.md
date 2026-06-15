# Tata Steel Crack Inspector — Implementation Complete

## Critical Fixes Applied ✅

### 1. **Correct InferenceResult Interface** 
The TypeScript types now match the real FastAPI response (not v0-invented field names):

```typescript
interface InferenceResult {
  verdict: "CRACK" | "OK";           // ← NOT crack_detected
  crack_prob: number;                // ← NOT crack_probability
  mask_coverage_pct: number;         // ← NOT mask_coverage_percentage
  mask_png_b64: string;              // ← NOT mask_overlay_base64
  latency_ms: number;
  cascade_triggered: boolean;
  // NOTE: No timestamp field
}
```

All component references have been updated to use `verdict === "CRACK"` instead of `crack_detected`, `results.crack_prob` instead of `crack_probability`, etc.

---

### 2. **CORS Middleware (for you to add to api.py)**

Your FastAPI backend **must** have CORS enabled. Add this to `api.py` right after `app = FastAPI(...)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Then restart uvicorn.** Without this, every browser request will fail silently with a CORS error.

---

### 3. **Configurable API URL** 
The API endpoint is now configurable via environment variable:

**`.env.local`:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For ngrok demo (tunnel):
```
NEXT_PUBLIC_API_BASE_URL=https://YOUR_NGROK_URL
```

The app will read this on startup with no rebuild needed.

---

## Architecture Overview

### Components

- **`Header`** — API status badge with 3s health-check timeout, 10s polling interval
- **`HeroSection`** — Two-column layout: drag-drop uploader (left) + settings sliders (right)
- **`DragDropZone`** — Accepts `.jpg`/`.png`, shows preview with FileReader
- **`SettingsPanel`** — Crack threshold & mask threshold sliders (0–1), disabled during loading
- **`ResultsSection`** — Verdict banner, 3 image cards (original, U-Net mask, Grad-CAM placeholder), 4 metric cards
- **`VerdictBanner`** — Red/green verdict with large probability % display
- **`MetricCard`** — Reusable card for latency, coverage %, cascade status
- **`AboutSection`** — 3-card pipeline explanation (ResNet18, U-Net, Grad-CAM)

### State Management (all in `app/page.tsx`)

```typescript
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [crackThreshold, setCrackThreshold] = useState(0.5);
const [maskThreshold, setMaskThreshold] = useState(0.5);
const [results, setInferenceResult] = useState<InferenceResult | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### API Integration (`utils/api.ts`)

```typescript
export async function predict(file: File): Promise<InferenceResult>
// POST to ${API_BASE}/predict with 30s timeout

export async function checkHealth(): Promise<boolean>
// GET to ${API_BASE}/health with 3s timeout
```

---

## Theme & Styling

### Design Tokens (in `globals.css`)

| Element | Color | Purpose |
|---------|-------|---------|
| Background | `#0f172a` (slate-950) | Mission-control dark |
| Cards | `#1e293b` (slate-800) | Contrast layer |
| Primary Accent | `#06b6d4` (cyan) | Healthy/active states |
| Accent (Alert) | `#ef4444` (red) | Cracks/warnings |
| Monospace Font | Geist Mono | All metrics/data |
| Borders | 1px solid `#475569` | Sharp, no radius |

### Key CSS Classes

- `.industrial-border` — Sharp 1px border in slate-700
- `.data-mono` — Font-mono + tracking-tight for metrics
- `.metric-label` — Uppercase, muted, small
- `.animate-fade-in` — Results section entrance
- `.status-online` / `.status-offline` — API status colors

---

## Running the Application

### Development

```bash
npm run dev
# Runs on http://localhost:3000
```

### With FastAPI Backend

**Terminal 1 (Next.js frontend):**
```bash
npm run dev
```

**Terminal 2 (FastAPI backend):**
```bash
cd /path/to/api
uvicorn api:app --reload
```

### For Live Demo (ngrok)

1. Start FastAPI normally
2. In a third terminal, tunnel to ngrok:
   ```bash
   ngrok http 8000
   ```
3. Copy the ngrok URL (e.g., `https://abc123.ngrok-free.app`)
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://abc123.ngrok-free.app
   ```
5. No rebuild needed—app reads env on startup

---

## Testing Checklist

- [ ] Upload a `.jpg` or `.png` steel plate image via drag-drop
- [ ] Verify preview displays correctly
- [ ] Adjust Crack Threshold slider (should show 0.00–1.00)
- [ ] Click "Run Inspection" → watch loading spinner
- [ ] Verify results appear with:
  - Verdict banner (green/red based on `verdict === "CRACK"`)
  - Original image + U-Net mask overlay
  - 4 metrics with correct formatting
- [ ] Check header API status (green = online, red = offline)
- [ ] Test error handling: unplug network, verify "API Offline" badge appears

---

## Known Limitations & Future Work

- **Grad-CAM Card** — Currently a placeholder. Will render once backend returns Grad-CAM heatmap
- **Sample Image Button** — Not yet implemented (optional enhancement: load severstal-steel-defect-detection/train_images/*.jpg)
- **File Validation** — Currently accepts MIME type check only, not file size limit
- **Mobile Responsiveness** — Responsive grid layout (1 col → 2 col → 3 col), but drag-drop UX on mobile can be improved

---

## File Structure

```
/app
  layout.tsx                    # Root layout with dark theme
  page.tsx                      # Main page & state management
  globals.css                   # Industrial theme + design tokens

/components
  header.tsx                    # API status badge + polling
  hero-section.tsx              # Two-column uploader + settings
  drag-drop-zone.tsx            # File upload with preview
  settings-panel.tsx            # Threshold sliders + run button
  results-section.tsx           # Verdict + images + metrics
  verdict-banner.tsx            # Large verdict card
  metric-card.tsx               # Reusable metric display
  about-section.tsx             # 3-card pipeline explanation

/types
  inference.ts                  # InferenceResult interface

/utils
  api.ts                        # predict() + checkHealth()

/.env.local                     # API_BASE_URL config
/IMPLEMENTATION_NOTES.md        # This file
```

---

## Troubleshooting

### "API: Offline" Status

1. Check if FastAPI is running on localhost:8000
2. Confirm CORS middleware is added to `api.py`
3. Verify `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
4. Check browser console (F12) for CORS errors

### Results Not Showing

1. Check that API response JSON keys match the interface:
   - `verdict`, `crack_prob`, `mask_coverage_pct`, `mask_png_b64`, `latency_ms`, `cascade_triggered`
2. Verify `mask_png_b64` is raw base64 (no `data:image/png;base64,` prefix)
3. Check browser console for fetch errors

### Styling Issues

- Check that `dark` class is on the `<html>` tag in `layout.tsx`
- Verify `bg-background` is on the body
- Ensure no conflicting CSS is overriding design tokens

---

## Production Deployment

When deploying to Vercel:

1. Set `NEXT_PUBLIC_API_BASE_URL` environment variable in Vercel project settings
2. Ensure FastAPI backend is reachable from your Vercel domain (e.g., ngrok URL or dedicated server)
3. Add production origins to CORS middleware in `api.py`:
   ```python
   allow_origins=["https://your-vercel-domain.vercel.app", "http://localhost:3000"]
   ```

---

**Build Date:** April 29, 2026  
**Next.js Version:** 14+ (App Router)  
**React Version:** 19.2.4+  
**Tailwind CSS:** 4+
