# 🌾 AgroAdvisor AI: Intelligent Crop & Disease Management

AgroAdvisor AI is a professional, full-stack agricultural advisory platform designed to help farmers make data-driven decisions. It combines **Soil-based Crop Recommendation** (99% Accuracy) with **Deep Learning Plant Disease Detection** (98.5% Accuracy) to provide a complete digital assistant for modern farming.

---

## 🌟 Key Features

- **🚀 Real-time Disease Detection**: Upload a leaf image to identify 38 different plant diseases using a custom ResNet-based CNN.
- **📈 Smart Crop Advisory**: Input soil nutrients (N, P, K), pH, and climate data to get the best crop recommendations.
- **💊 Expert Treatment Advice**: Get actionable agricultural solutions for every detected disease.
- **⚡ GPU Optimized**: Built with PyTorch and CUDA for lightning-fast training and inference.
- **🎨 Premium UI**: Modern, responsive dashboard built with Next.js and Tailwind CSS.

---

## 🏗️ Project Architecture

```text
AgroAdvisor_AI/
├── backend/                # FastAPI Python Server & AI Scripts
│   ├── main.py             # Entry point
│   ├── model_inference.py  # AI Prediction Logic
│   ├── pytorch_model.py    # CNN Architecture
│   ├── train_disease_model.py # Training Script
│   └── requirements.txt    # Python Dependencies
├── frontend/               # Next.js React Web App
├── models/                 # Trained AI Weights (.pth, .pkl, .json)
├── data/                   # Database & Metadata
│   ├── advisory.db         # SQLite Prediction History
│   ├── crop_info.json      # Crop Encyclopedia
│   └── disease_info.json   # Disease Metadata
├── plant_dataset/          # Raw Training Images (Ignored by Git)
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- NVIDIA GPU (Optional, for fast training)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Run the server
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🤖 Machine Learning Details

### Plant Disease Detection (PyTorch)
- **Architecture**: Custom ResNet-like CNN with 512-channel residual blocks.
- **Dataset**: 70,295 training images across 38 classes.
- **Performance**: **98.5% Validation Accuracy** achieved in 1 epoch on GPU.
- **Input**: 256x256 RGB leaf images.

### Crop Recommendation (Scikit-Learn)
- **Architecture**: Random Forest Classifier with Feature Engineering.
- **Features**: N, P, K, Temperature, Humidity, pH, Rainfall.
- **Performance**: **99% Cross-Validation Accuracy**.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, PyTorch (Deep Learning), Scikit-Learn (ML), NumPy.
- **Data Handling**: Pandas, Pillow, TorchVision.
- **Server**: Uvicorn.

---

## 👨‍💻 Author
Built as a Final Project for **Lovely Professional University**.

---

## 📄 License
This project is for academic and research purposes.
