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
│   ├── core/           # Business Logic & AI Architectures
│   │   └── architectures/ # Model Class Definitions (Python)
│   ├── scripts/        # Utility & Training Scripts
│   ├── main.py         # API Entry Point
│   ├── routes.py       # API Endpoints
│   └── database.py     # SQLite/ORM logic
├── frontend/           # Next.js React Web Application
├── models/             # Trained Model Weights & Encoders (.pth, .pkl)
├── data/               # App Data (Database & JSON Metadata)
│   ├── metadata/       # Crop & Disease Encyclopedias
│   └── advisory.db     # Local Prediction History
├── datasets/           # Raw Training Data & Local Backups
├── scripts/            # Global Utility Scripts
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

## ☁️ Deployment (Render)

This project is prepared for one-click deployment on **Render** using the included `render.yaml` blueprint.

1.  Push this code to **GitHub**.
2.  In **Render Dashboard**, click **New +** -> **Blueprint**.
3.  Connect your repository.
4.  Configure the required environment variables in the Render Dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, PyTorch (CPU Optimized), Scikit-Learn.
- **AI Models**: CNN (Disease Detection), Neural Networks (Location & Soil Intelligence).
- **Advisory**: Gemini AI integration for dynamic cultivation manuals.

---

## 🔒 Environment Variables

### Backend (`/backend/.env`)
- `GEMINI_API_KEY`: Get from Google AI Studio.

### Frontend (`/frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://agroadvisor-api.onrender.com/api`).
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard.
- `CLERK_SECRET_KEY`: From Clerk dashboard.

---

## 📄 License
This project is for academic and research purposes.

