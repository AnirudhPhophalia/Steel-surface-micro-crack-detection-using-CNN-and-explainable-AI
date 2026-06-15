# app/api.py  —  run with:  uvicorn app.api:app --reload  (from projSteel/)
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import io, cv2, base64, time, json
import numpy as np, torch
from PIL import Image

app = FastAPI(
    title="Tata Steel Crack Inspector",
    description="Two-stage crack detection: ResNet18 classifier → U-Net mask.",
    version="1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUTS_DIR = ROOT_DIR / "outputs"
RUNS_DIR = OUTPUTS_DIR / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)
if OUTPUTS_DIR.exists():
    app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load both TorchScript models at startup --------------------------------------
clf  = torch.jit.load(str(ROOT_DIR / "resnet18_traced.pt.zip"), map_location=device).eval()
unet = torch.jit.load(str(ROOT_DIR / "unet_traced.pt.zip"), map_location=device).eval()
print("Models loaded on", device)

MEAN = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
STD  = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)

def _preprocess(img_rgb: np.ndarray, size: int = 256) -> torch.Tensor:
    img = cv2.resize(img_rgb, (size, size))
    t = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
    return ((t - MEAN) / STD).unsqueeze(0).to(device)

@app.get("/")
def root():
    return {"service": "Tata Steel Crack Inspector", "device": str(device),
            "endpoints": ["/health", "/predict", "/runs"]}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    crack_threshold: float = Form(0.5),
    mask_threshold: float = Form(0.5),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Upload an image file.")
    raw = await file.read()
    try:
        img = np.array(Image.open(io.BytesIO(raw)).convert("RGB"))
    except Exception as e:
        raise HTTPException(400, f"Could not decode image: {e}")

    x = _preprocess(img)

    t0 = time.time()
    with torch.no_grad():
        prob = torch.softmax(clf(x), 1)[0, 1].item()
        # Run Stage-2 only if Stage-1 flags it (cascade)
        if prob >= crack_threshold:
            mask = torch.sigmoid(unet(x))[0, 0].cpu().numpy()
        else:
            mask = np.zeros((256, 256), dtype=np.float32)
    latency_ms = (time.time() - t0) * 1000

    mask_bin = (mask >= mask_threshold).astype(np.uint8)
    mask_coverage_pct = float(mask_bin.mean() * 100)
    _, buf = cv2.imencode(".png", (mask_bin * 255).astype(np.uint8))

    run_id = time.strftime("%Y%m%d-%H%M%S") + f"-{int(time.time() * 1000) % 1000:03d}"
    run_dir = RUNS_DIR / run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    original_path = run_dir / "original.png"
    mask_path = run_dir / "mask.png"
    metadata_path = run_dir / "metadata.json"
    Image.fromarray(img).save(original_path)
    with mask_path.open("wb") as f:
        f.write(buf)

    created_at = time.strftime("%Y-%m-%dT%H:%M:%S")
    metadata = {
        "run_id": run_id,
        "created_at": created_at,
        "verdict": "CRACK" if prob >= crack_threshold else "OK",
        "crack_prob": float(prob),
        "mask_coverage_pct": mask_coverage_pct,
        "latency_ms": round(latency_ms, 2),
        "cascade_triggered": bool(prob >= crack_threshold),
        "artifacts": {
            "original_url": f"/outputs/runs/{run_id}/original.png",
            "mask_url": f"/outputs/runs/{run_id}/mask.png",
            "metadata_url": f"/outputs/runs/{run_id}/metadata.json",
        },
    }
    with metadata_path.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    return JSONResponse({
        "verdict":            "CRACK" if prob >= crack_threshold else "OK",
        "crack_prob":         float(prob),
        "mask_coverage_pct":  mask_coverage_pct,
        "mask_png_b64":       base64.b64encode(buf).decode(),
        "latency_ms":         round(latency_ms, 2),
        "cascade_triggered":  bool(prob >= crack_threshold),
    })


@app.get("/runs")
def list_runs(limit: int = 20):
    if not RUNS_DIR.exists():
        return []

    items = []
    for run_dir in RUNS_DIR.iterdir():
        if not run_dir.is_dir():
            continue
        metadata_path = run_dir / "metadata.json"
        if not metadata_path.exists():
            continue
        try:
            with metadata_path.open("r", encoding="utf-8") as f:
                items.append(json.load(f))
        except Exception:
            continue

    items.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return items[: max(0, limit)]