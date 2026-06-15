# Testing Guide — Tata Steel Crack Inspector

## Quick Start

### 1. Frontend Running
```bash
npm run dev
# Opens http://localhost:3000
```

### 2. Backend Ready?

**Option A: FastAPI Running**
```bash
# Terminal 2
cd /path/to/api
uvicorn api:app --reload --port 8000
```
Ensure CORS middleware is added (see IMPLEMENTATION_NOTES.md).

**Option B: Testing Without Backend**
Temporarily modify `utils/api.ts` to return mock data for UI verification.

---

## Test Scenarios

### Scenario 1: Upload & Inspect (with FastAPI)

1. Open http://localhost:3000
2. Check header: Should show "API: Online" (green dot)
3. Click uploader → select a steel plate image (.jpg or .png)
4. Preview displays in the upload area
5. Adjust sliders (Crack Threshold, Mask Threshold)
6. Click "Run Inspection"
7. Watch loader spin for ~10-30ms (backend latency)
8. Results appear:
   - Verdict banner (red if crack, green if OK)
   - Probability % (large number)
   - Original image + U-Net mask overlay
   - 4 metrics with monospace font
9. Scroll down to see About section (pipeline explanation)

### Scenario 2: API Offline Handling

1. Kill FastAPI process (Ctrl+C in backend terminal)
2. Header should update to "API: Offline" (red dot) after ~10s
3. "Run Inspection" button remains disabled until API returns
4. Restarting FastAPI should show "API: Online" again

### Scenario 3: Network Error

1. Stop backend
2. Upload image, click "Run Inspection"
3. Error toast appears: "Error: API error: network error"
4. Verify error message displays gracefully

---

## Expected API Response Format

Your FastAPI `/predict` endpoint **must** return:

```json
{
  "verdict": "CRACK",
  "crack_prob": 0.87,
  "mask_coverage_pct": 4.32,
  "mask_png_b64": "iVBORw0KGgo...",
  "latency_ms": 10.05,
  "cascade_triggered": true
}
```

**Critical:** Field names must exactly match. If you return different keys, the app will show NaN or undefined values.

---

## Browser DevTools Checklist

Open F12 → Network tab → Upload image → Look for:

1. **Request:** `POST http://localhost:8000/predict`
   - Request body: `FormData` with `file` field
   - Method: POST
   - No CORS errors in Console

2. **Response:** Status 200, JSON body with above fields
   - Check Response tab to verify field names
   - If you see `crack_probability`, that's wrong—should be `crack_prob`

3. **Console:** No errors, only normal React warnings

---

## Responsive Design Testing

### Desktop (1024px+)
- Hero: 2 columns (uploader left, settings right)
- Images: 3-column grid
- Metrics: 4-column grid

### Tablet (768px)
- Hero: 2 columns (still side-by-side)
- Images: 3-column grid (may wrap)
- Metrics: 2x2 grid

### Mobile (< 640px)
- Hero: 1 column (stacked)
- Images: 1-column grid
- Metrics: 1-column grid

Resize browser window and verify layout reflows correctly.

---

## Performance Notes

### Expected Timings

- **File upload:** Instant (local FileReader)
- **API request round-trip:** ~10–50ms (depending on backend)
- **Results rendering:** ~300ms (CSS animation)
- **Health check polling:** 10s interval (no performance impact)

### Monitoring

Open DevTools → Performance tab:
1. Click Record
2. Upload image, run inspection
3. Click Stop
4. Check for jank or long tasks (should be clean)

---

## Troubleshooting Checklist

| Issue | Check |
|-------|-------|
| "API: Offline" stuck | Is FastAPI running? CORS added? |
| Results show NaN | Check API response field names match interface |
| Drag-drop not working | Browser console for JS errors? File type .jpg/.png? |
| Slider not responsive | React Dev Tools: is threshold state updating? |
| Image won't preview | Check FileReader error, CORS on image source |
| Metrics not displaying | Verify `latency_ms`, `mask_coverage_pct` are numbers |

---

## Deployment Testing

### Before Production

1. Build locally: `npm run build && npm start`
2. Test with `.env.local` pointing to ngrok/prod backend
3. Verify all API calls succeed with prod credentials
4. Check CORS headers in browser Network tab
5. Test on actual mobile device (not just DevTools emulation)

### Vercel Deployment

```bash
vercel deploy
# Set NEXT_PUBLIC_API_BASE_URL in Vercel project settings
```

---

That's it! Happy inspecting. 🔍
