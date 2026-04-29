# app/api.py  —  run with:  uvicorn app.api:app --reload  (from projSteel/)
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import io, cv2, base64, time
import numpy as np, torch
from PIL import Image

app = FastAPI(
    title="Tata Steel Crack Inspector",
    description="Two-stage crack detection: ResNet18 classifier → U-Net mask.",
    version="1.0",
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load both TorchScript models at startup --------------------------------------
clf  = torch.jit.load("checkpoints/resnet18_traced.pt", map_location=device).eval()
unet = torch.jit.load("unet_traced.pt",                 map_location=device).eval()
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
            "endpoints": ["/health", "/predict"]}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
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
        if prob >= 0.5:
            mask = torch.sigmoid(unet(x))[0, 0].cpu().numpy()
        else:
            mask = np.zeros((256, 256), dtype=np.float32)
    latency_ms = (time.time() - t0) * 1000

    _, buf = cv2.imencode(".png", (mask * 255).astype(np.uint8))
    return JSONResponse({
        "verdict":            "CRACK" if prob >= 0.5 else "OK",
        "crack_prob":         float(prob),
        "mask_coverage_pct":  float(mask.mean() * 100),
        "mask_png_b64":       base64.b64encode(buf).decode(),
        "latency_ms":         round(latency_ms, 2),
        "cascade_triggered":  bool(prob >= 0.5),
    })