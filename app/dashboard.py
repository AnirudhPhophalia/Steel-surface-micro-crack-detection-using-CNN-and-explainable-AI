# app/dashboard.py  —  run with:  streamlit run app/dashboard.py
import streamlit as st
import torch, torch.nn as nn, torch.nn.functional as F
import cv2, numpy as np, pathlib, sys, io
from PIL import Image
from torchvision import models

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT))

st.set_page_config(page_title="Steel Crack Inspector", layout="wide")
st.title("🔍 Tata Steel — Crack Inspection Dashboard")
st.caption("Two-stage pipeline: ResNet18 patch classifier → U-Net segmentation, with Grad-CAM explanations.")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Model loading (cached across re-runs) ────────────────────────────────────
@st.cache_resource
def load_models():
    # Non-traced classifier (so Grad-CAM can hook into layer4[-1])
    def build_resnet():
        m = models.resnet18(weights=None)
        m.fc = nn.Sequential(nn.Dropout(0.4), nn.Linear(m.fc.in_features, 2))
        return m
    ckpt = torch.load(str(ROOT / "checkpoints/resnet18_best.pth"),
                      map_location=device, weights_only=False)
    clf = build_resnet().to(device)
    clf.load_state_dict(ckpt["model_state"])
    clf.eval()
    for p in clf.parameters(): p.requires_grad_(True)   # needed for Grad-CAM
    unet = torch.jit.load(str(ROOT / "unet_traced.pt"), map_location=device).eval()
    return clf, unet

# ── Grad-CAM (same as Cell 17) ───────────────────────────────────────────────
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.grads = self.acts = None
        target_layer.register_forward_hook(self._fwd)
        target_layer.register_full_backward_hook(self._bwd)
    def _fwd(self, _m, _i, out):  self.acts = out.detach()
    def _bwd(self, _m, _gi, go):  self.grads = go[0].detach()
    def __call__(self, x, class_idx=1):
        logits = self.model(x)
        self.model.zero_grad()
        logits[:, class_idx].sum().backward()
        w = self.grads.mean(dim=(2, 3), keepdim=True)
        cam = F.relu((w * self.acts).sum(dim=1, keepdim=True))
        cam = F.interpolate(cam, size=x.shape[-2:], mode="bilinear", align_corners=False)
        cam = cam.squeeze().cpu().numpy()
        return (cam - cam.min()) / (cam.max() - cam.min() + 1e-8), torch.softmax(logits, 1)[0, 1].item()

def overlay_cam(img_rgb, cam, alpha=0.45):
    heat = cv2.applyColorMap((cam * 255).astype(np.uint8), cv2.COLORMAP_JET)
    heat = cv2.cvtColor(heat, cv2.COLOR_BGR2RGB)
    return (alpha * heat + (1 - alpha) * img_rgb).astype(np.uint8)

MEAN = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
STD  = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)

def preprocess(img_rgb, size=256):
    img = cv2.resize(img_rgb, (size, size))
    t = torch.from_numpy(img).permute(2, 0, 1).float() / 255.
    return ((t - MEAN) / STD).unsqueeze(0).to(device)

# ── Load models + set up CAM ─────────────────────────────────────────────────
clf, unet = load_models()
cam_obj = GradCAM(clf, clf.layer4[-1])

# ── Sidebar controls ─────────────────────────────────────────────────────────
st.sidebar.header("Controls")
thr = st.sidebar.slider("Crack probability threshold", 0.1, 0.9, 0.5, 0.05)
mask_thr = st.sidebar.slider("Mask threshold", 0.1, 0.9, 0.5, 0.05)
show_cam = st.sidebar.checkbox("Show Grad-CAM", value=True)

st.sidebar.markdown("---")
st.sidebar.markdown("**Pipeline**")
st.sidebar.markdown("1. ResNet18 → crack probability\n2. If prob ≥ threshold → U-Net mask\n3. Grad-CAM highlights the regions ResNet looked at")

# ── Uploader ─────────────────────────────────────────────────────────────────
up = st.file_uploader("Upload a steel plate image", type=["jpg", "jpeg", "png"])

if up:
    img = np.array(Image.open(up).convert("RGB"))

    # Forward + Grad-CAM (grad enabled)
    x_small = preprocess(img, size=256)
    cam, prob = cam_obj(x_small, class_idx=1)

    with torch.no_grad():
        mask = torch.sigmoid(unet(x_small))[0, 0].cpu().numpy()

    # Build visualisations at the original image resolution
    img_256 = cv2.resize(img, (256, 256))
    cam_overlay = overlay_cam(img_256, cam)

    mask_full = cv2.resize(mask, (img.shape[1], img.shape[0]))
    mask_overlay = img.copy()
    mask_overlay[mask_full > mask_thr] = (
        mask_overlay[mask_full > mask_thr] * 0.35 + np.array([226, 75, 74]) * 0.65
    ).astype(np.uint8)

    # ── Layout ───────────────────────────────────────────────────────────────
    verdict = "CRACK" if prob >= thr else "OK"
    verdict_color = "red" if verdict == "CRACK" else "green"

    st.markdown(
        f"<h2 style='color:{verdict_color};'>Verdict: {verdict}  |  probability = {prob:.3f}</h2>",
        unsafe_allow_html=True,
    )
    st.progress(min(prob, 1.0))

    c1, c2 = st.columns(2)
    c1.image(img, caption="Original plate", use_container_width=True)
    if show_cam:
        c2.image(cam_overlay, caption="Grad-CAM — what Stage-1 focused on",
                 use_container_width=True)
    else:
        c2.image(img_256, caption="Grad-CAM disabled", use_container_width=True)

    st.image(mask_overlay.astype(np.uint8),
             caption=f"Stage-2 U-Net mask overlay — coverage {mask.mean()*100:.2f}%",
             use_container_width=True)

    # Metrics row
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Crack probability", f"{prob:.3f}")
    m2.metric("Mask coverage", f"{(mask>mask_thr).mean()*100:.2f}%")
    m3.metric("Verdict", verdict)
    m4.metric("Cascade triggered", "Yes" if prob >= thr else "No")

    # Download annotated image
    buf = io.BytesIO()
    Image.fromarray(mask_overlay.astype(np.uint8)).save(buf, format="PNG")
    st.download_button("⬇ Download annotated plate (PNG)",
                       data=buf.getvalue(),
                       file_name=f"annotated_{up.name.rsplit('.',1)[0]}.png",
                       mime="image/png")
else:
    st.info("Upload a plate image to run inspection. Try one from `severstal-steel-defect-detection/train_images/`.")