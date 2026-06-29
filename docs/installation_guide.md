# CareerVault Installation Guide

## Overview

This guide explains how to set up CareerVault locally for development. CareerVault consists of a **Flask backend**, a **React + Vite frontend**, **MongoDB Atlas**, and **Firebase Authentication**.

---

## Prerequisites

| Requirement | Version |
|--------------|---------|
| Node.js | 18+ |
| Python | 3.11+ |
| MongoDB Atlas account | — |
| Firebase project | — |

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/CareerVault.git
cd CareerVault
```

---

## 2. Backend Setup

### 2.1 Navigate to backend folder
```bash
cd backend
```

### 2.2 Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

### 2.3 Install dependencies
```bash
pip install -r requirements.txt
```

Key backend dependencies include: Flask, MongoEngine, pdfplumber, PyMuPDF, and wordninja.

### 2.4 Configure environment variables
```bash
cp .env.example .env
```
Fill in the following (exact variable names TODO — confirm against `.env.example`):
```
MONGO_URI=TODO
SECRET_KEY=TODO
FIREBASE_CREDENTIALS=TODO
```

### 2.5 Run the backend server
```bash
python app.py
```

Backend runs at: **`http://localhost:5000`**

---

## 3. Frontend Setup

### 3.1 Navigate to frontend folder
```bash
cd frontend
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Configure environment variables
```bash
cp .env.example .env
```
Fill in (exact variable names TODO — confirm against `.env.example`):
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=TODO
VITE_FIREBASE_AUTH_DOMAIN=TODO
VITE_FIREBASE_PROJECT_ID=TODO
```

### 3.4 Run the frontend dev server
```bash
npm run dev
```

Frontend runs at: **`http://localhost:5173`**

---

## 4. Database Setup

- Create a MongoDB Atlas cluster and obtain a connection string for `MONGO_URI`.
- TODO: confirm whether seed/sample data is provided, or whether the database must be populated by running the PDF ingestion pipeline.

---

## 5. Running the Parsing Pipeline (Optional)

To ingest new interview experience PDFs:

1. Place PDFs in `backend/uploads/`.
2. Run the ingestion pipeline (TODO: confirm exact entry point — likely via `backend/services/pipeline.py` or a CLI/script wrapper).
3. To **reprocess** previously uploaded PDFs in bulk, use:
   ```bash
   python scripts/reprocess_from_pdfs.py
   ```
   (Run from within `backend/`, with the virtual environment activated.)

---

## 6. Verifying the Setup

1. Backend reachable at `http://localhost:5000/api/v1/stats` and returns statistics JSON.
2. Frontend loads at `http://localhost:5173` and the Dashboard displays correct stats.
3. Firebase login works end-to-end.
4. Companies page lists 25+ companies (assuming seeded/migrated data).

---

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|------------------|----------|
| Backend fails to start | Missing dependencies / invalid `MONGO_URI` | Verify `.env` values and that the MongoDB Atlas cluster allows your IP |
| Frontend can't reach backend | Wrong `VITE_API_BASE_URL` or CORS misconfiguration | Confirm backend CORS settings allow `http://localhost:5173` |
| Firebase login fails | Misconfigured Firebase keys or unauthorized domain | Check Firebase console authorized domains and `.env` keys |
| PDF parsing errors | Malformed/scanned PDF, OCR issues | TODO — confirm fallback behavior in `pdf_extractor.py` |

---

## Notes

- Environment variable names are based on common Flask/Vite conventions and are marked `TODO` where the actual `.env.example` contents were not provided — confirm against the real file before distributing this guide.