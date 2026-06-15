# Tata Steel Crack Inspector

**AI-powered surface defect detection dashboard** — Production-grade quality-control system for industrial steel surface inspection.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2014+-blue)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-blue)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ / pnpm 8+
- FastAPI backend running on `localhost:8000` with CORS enabled

### Installation & Dev

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
# Opens http://localhost:3000

# In another terminal, start FastAPI backend
cd /path/to/api
uvicorn api:app --reload
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main page component with state management |
| `types/inference.ts` | TypeScript interface for API responses |
| `utils/api.ts` | API calls (`predict()`, `checkHealth()`) |
| `app/globals.css` | Dark industrial theme & design tokens |
| `components/*.tsx` | UI components (header, hero, results, etc.) |
| `.env.local` | API base URL configuration |

---

## 📋 Architecture

### Component Hierarchy

```
page.tsx (state container)
├── Header (API status badge, health polling)
├── HeroSection
│   ├── DragDropZone (file uploader + preview)
│   └── SettingsPanel (threshold sliders + run button)
├── ResultsSection (conditional render)
│   ├── VerdictBanner (crack/ok verdict)
│   ├── Image Cards (original, U-Net mask, Grad-CAM)
│   └── Metrics (4-card grid)
└── AboutSection (3-card pipeline explanation)
```

### State Management

All state lives in `app/page.tsx`:
- `uploadedFile` — selected image File
- `previewUrl` — base64 preview URL
- `crackThreshold`, `maskThreshold` — slider values (0–1)
- `results` — InferenceResult or null
- `isLoading` — during API call
- `error` — error message if request fails

---

## 🎨 Design System

### Colors (Dark Industrial Aesthetic)

| Token | Color | Usage |
|-------|-------|-------|
| Background | `#0f172a` | Main canvas (slate-950) |
| Card | `#1e293b` | Component backgrounds (slate-800) |
| Primary | `#06b6d4` | Accents, active states (cyan) |
| Accent | `#ef4444` | Warnings, cracks (red) |
| Border | `#475569` | Sharp 1px borders (slate-600) |
| Foreground | `#f1f5f9` | Text (slate-100) |

### Typography

- **Headings:** Geist Sans (regular weight)
- **Metrics/Data:** Geist Mono (fixed-width, "Bloomberg terminal" feel)
- **Labels:** Small, uppercase, muted color

### Grid & Layout

- **Flexbox first** for most layouts
- **Sharp borders** (no border-radius)
- **Monospace metrics** in data displays
- **Responsive:** 1 col (mobile) → 2 col (tablet) → 3+ col (desktop)

---

## 🔌 API Integration

### Expected Endpoint: `/predict`

**Request:**
```
POST http://localhost:8000/predict
Content-Type: multipart/form-data

file: <binary image data>
```

**Response:**
```json
{
  "verdict": "CRACK" | "OK",
  "crack_prob": 0.87,
  "mask_coverage_pct": 4.32,
  "mask_png_b64": "iVBORw0KG...",
  "latency_ms": 10.05,
  "cascade_triggered": true
}
```

### Critical Fixes Applied ✅

1. **Correct Field Names** — Interface matches real API response
   - `verdict` (not `crack_detected`)
   - `crack_prob` (not `crack_probability`)
   - `mask_coverage_pct` (not `mask_coverage_percentage`)
   - `mask_png_b64` (not `mask_overlay_base64`)
   - No `timestamp` field

2. **CORS Middleware** — Add to FastAPI (`api.py`):
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "*"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Configurable API URL** — Set in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```
   For ngrok demo:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://YOUR_NGROK_URL
   ```

---

## 📊 Features

### User Interface

- **Drag-and-drop file uploader** — Click or drag `.jpg`/`.png` images
- **Live preview** — See uploaded image before inspection
- **Configuration sliders** — Crack threshold & mask threshold (0–1)
- **Verdict banner** — Large, color-coded result (red/green)
- **Image cards** — Original plate, U-Net segmentation mask, Grad-CAM (placeholder)
- **Metrics display** — Probability %, mask coverage %, latency, cascade status
- **Pipeline explanation** — 3-card description of two-stage architecture

### Backend Integration

- **Health check polling** — Monitors API status every 10s (3s timeout)
- **Request timeout** — 30s max per inference call
- **Error handling** — Toast notifications for network failures
- **Loading states** — Spinner button during inference

---

## 🏗️ Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set `NEXT_PUBLIC_API_BASE_URL` in Vercel project settings
4. Deploy

**For ngrok demo:**
```
NEXT_PUBLIC_API_BASE_URL=https://abc123.ngrok-free.app
```

---

## 📖 Documentation

- **`IMPLEMENTATION_NOTES.md`** — Detailed architecture, troubleshooting, production notes
- **`TESTING_GUIDE.md`** — Test scenarios, DevTools checklist, performance monitoring

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + Custom CSS variables |
| UI Components | shadcn/ui (customized) |
| Icons | Lucide React |
| Font | Geist / Geist Mono (Google Fonts) |

---

## 📝 License

Built for Tata Steel. All rights reserved.

---

## 🎯 Next Steps

1. Start dev server: `pnpm dev`
2. Verify FastAPI is running with CORS enabled
3. Check `.env.local` points to correct API URL
4. Upload a test image and run inspection
5. View results with verdict, images, and metrics
6. Check `IMPLEMENTATION_NOTES.md` for production deployment

**Questions?** See `TESTING_GUIDE.md` for troubleshooting or check browser DevTools Network tab for API response validation.

---

**Status:** ✅ Production-ready  
**Last Updated:** April 29, 2026
