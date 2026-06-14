# Steel Surface Micro-Crack Detection using ResNet18, U-Net, and Explainable AI

## Overview

Steel plates used in industrial manufacturing often develop micro-level surface cracks during rolling and cooling processes. These defects are difficult to identify manually due to their small size, low contrast, and high production-line speed.

This project presents a two-stage deep learning pipeline for automated crack detection and localization on steel surfaces using the Severstal Steel Defect Detection dataset. The system combines classification, segmentation, and explainability to create a practical industrial inspection solution.

### Key Features

* ResNet18-based crack classification
* U-Net-based pixel-level crack segmentation
* Grad-CAM explainability for model interpretation
* Class imbalance handling through weighted loss functions
* Data augmentation for improved generalization
* Deployment-ready architecture with ONNX and TorchScript support

---

## Problem Statement

Micro-cracks in steel plates can lead to structural failures in downstream applications such as:

* Automotive components
* Bridges
* Pressure vessels
* Heavy machinery

Traditional manual inspection struggles because:

* Production lines operate at high speed
* Cracks occupy less than 1% of image pixels
* Surface textures create significant noise
* Human inspection is inconsistent and subjective

The goal is to automatically detect and localize crack defects with high accuracy while providing explainable predictions.

---

## Dataset

### Severstal Steel Defect Detection Dataset

Source: Kaggle

#### Dataset Statistics

* Total Images: ~12,568
* Image Resolution: 256 × 1600 pixels
* Image Type: Grayscale (converted to 3-channel input)
* Annotation Format: Run-Length Encoding (RLE)
* Defect Classes: 4

This project focuses primarily on:

**Class 1 – Surface Cracks**

#### Challenges

* Severe class imbalance
* Small crack regions
* Lighting variations
* Background texture noise
* Sparse pixel annotations

---

## System Architecture

### Stage 1: Crack Classification

A ResNet18 classifier identifies whether a patch contains crack defects.

#### Model Details

* Pretrained ResNet18 backbone
* Transfer Learning from ImageNet
* Weighted Cross Entropy Loss
* AdamW Optimizer
* Cosine Annealing Learning Rate Scheduler
* Gradient Clipping

#### Output

* Crack probability score
* Patch-level predictions
* Plate-level heatmaps

---

### Stage 2: Crack Segmentation

A U-Net architecture performs precise pixel-level localization of cracks.

#### Architecture

Input Image Tile
→ Encoder
→ Bottleneck
→ Decoder with Skip Connections
→ Binary Crack Mask

#### Evaluation Metrics

* Dice Coefficient
* Intersection over Union (IoU)
* Pixel-wise F1 Score

---

### Explainable AI (XAI)

Grad-CAM is used to visualize the regions influencing model predictions.

#### Benefits

* Increased model transparency
* Easier debugging
* Improved trust for industrial deployment
* Validation of model attention on crack regions

---

## Data Preprocessing

### Image Processing

* RLE Mask Decoding
* Patch Extraction
* Tile Generation
* Image Normalization

### Data Augmentation

* Horizontal Flip
* Vertical Flip
* Gaussian Blur
* CLAHE Contrast Enhancement
* Rotation and Affine Transformations

---

## Results

### Stage 1: ResNet18 Classifier

| Metric               | Value  |
| -------------------- | ------ |
| Accuracy             | 99.28% |
| ROC-AUC              | 0.988  |
| Crack Class F1 Score | 0.89   |
| Weighted F1 Score    | 0.99   |

### Stage 2: U-Net Segmentation

| Metric                                        | Value |
| --------------------------------------------- | ----- |
| Validation Dice Score (Pretrained Encoder)    | ~0.71 |
| Validation Dice Score (Random Initialization) | ~0.64 |

### Observations

* Transfer learning significantly improves segmentation performance.
* The two-stage pipeline reduces unnecessary segmentation computation.
* Grad-CAM successfully highlights defect regions relevant to model predictions.

---

## Tech Stack

### Deep Learning

* PyTorch
* torchvision
* segmentation_models_pytorch

### Computer Vision

* OpenCV
* Albumentations

### Data Processing

* NumPy
* Pandas

### Visualization

* Matplotlib
* Grad-CAM

### Deployment

* TorchScript
* ONNX
* FastAPI
* Streamlit

---

## Project Structure

```text
steel-crack-detection/
│
├── data/
├── notebooks/
├── models/
├── outputs/
├── gradcam_results/
├── segmentation_results/
├── app/
│   ├── fastapi_server.py
│   └── streamlit_dashboard.py
│
├── train_classifier.py
├── train_unet.py
├── inference.py
├── requirements.txt
└── README.md
```

---

## Future Work

* Multi-class defect segmentation for all four Severstal defect classes
* Real-time production-line deployment
* Transformer-based segmentation models
* Continuous learning from operator feedback
* Ensemble models for improved segmentation accuracy
* Edge deployment using TensorRT and OpenVINO

---

## Contributors

* Anushka Verma
* Vaani
* Khagendra
* Anirudh
* Manvi

---

## References

1. He et al., Deep Residual Learning for Image Recognition (CVPR 2016)
2. Ronneberger et al., U-Net: Convolutional Networks for Biomedical Image Segmentation (MICCAI 2015)
3. Selvaraju et al., Grad-CAM: Visual Explanations from Deep Networks (ICCV 2017)
4. Severstal Steel Defect Detection Competition (Kaggle)

---

## License

This project is intended for academic and educational purposes.
