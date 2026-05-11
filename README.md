# 🌾 AgroAdvisor AI: Intelligent Crop & Disease Management

AgroAdvisor AI is a professional, full-stack agricultural advisory platform designed to help farmers make data-driven decisions. It combines **Soil-based Crop Recommendation**, **Location-aware Advisory**, and **Deep Learning Plant Disease Detection** to provide a complete digital assistant for modern farming.

---

## 🌟 Key Features

- **🚀 Real-time Disease Detection**: Identify plant diseases from leaf images with high accuracy.
- **📈 Smart Crop Advisory**: Soil-based (N, P, K, pH) and Location-based (State/District/Tehsil) recommendations.
- **💊 Expert Treatment Advice**: Actionable solutions and organic remedies for every detected disease.
- **☁️ Weather & Market Insights**: Real-time local weather and mandi prices for major crops.
- **🎨 Premium UI**: A modern, responsive dashboard built for professional agricultural use.

---

## 🏗️ Project Architecture

```text
AgroAdvisor_AI/
├── backend/            # FastAPI Server & AI Inference Logic
├── frontend/           # Next.js React Web Application
├── models/             # Production-ready AI Model Weights (.pth, .pkl)
├── data/               # App Data (Database & JSON Metadata)
│   ├── metadata/       # Crop & Disease Encyclopedias
│   └── advisory.db     # Local Prediction History
├── datasets/           # Raw Training Data & Local Backups (Ignored by Git)
├── scripts/            # Utility & Data Processing Scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv (Windows: .\venv\Scripts\activate | Unix: source venv/bin/activate)
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, PyTorch, Scikit-Learn, NumPy, Pandas.
- **AI Models**: CNN (Disease), Random Forest (Crop), Neural Networks (Location/Soil).
- **APIs**: Open-Meteo (Weather), Gemini AI (Advanced Growth Guides).

---

## 🔒 Environment Variables
Ensure you have the following in your `.env` files:
- **Backend**: `GEMINI_API_KEY`, `OPENWEATHERMAP_API_KEY` (optional)
- **Frontend**: `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

---

## 📄 License
This project is for academic and research purposes.

