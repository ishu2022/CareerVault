# CareerVault Developer Guide

## Overview

This guide is for developers contributing to or maintaining the CareerVault codebase. It covers project structure, conventions, and how to work on the backend, frontend, and PDF parsing pipeline.

---

## Tech Stack Summary

**Frontend:** React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Lucide React
**Backend:** Python 3.11, Flask 3, MongoEngine, pdfplumber, PyMuPDF, wordninja
**Database:** MongoDB Atlas
**Authentication:** Firebase Authentication
**Deployment Targets:** Vercel (frontend), Render (backend)

---

## Project Structure

```
CareerVault/
├── backend/
│   ├── api/                        # Route blueprints
│   │   ├── companies.py
│   │   ├── experiences.py
│   │   ├── questions.py
│   │   ├── stats.py
│   │   └── contribute.py
│   ├── models/
│   │   └── interview.py            # MongoEngine document models
│   ├── services/
│   │   ├── pdf_extractor.py        # pdfplumber + PyMuPDF extraction
│   │   ├── rule_parser.py          # Custom NLP parser
│   │   ├── pipeline.py             # End-to-end ingestion pipeline
│   │   └── company_normalizer.py   # Canonical company name mapping
│   ├── scripts/
│   │   └── reprocess_from_pdfs.py  # Batch reprocessing script
│   ├── uploads/                    # PDF storage
│   ├── app.py                      # Flask app entry point
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route-level page components
│   │   ├── context/                # React context (Auth, etc.)
│   │   ├── api/                    # Axios API service layer
│   │   └── assets/                 # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## Backend Development

### Adding a New API Endpoint
1. Add the route to the relevant blueprint file in `backend/api/` (`companies.py`, `experiences.py`, `questions.py`, `stats.py`, or `contribute.py`), or create a new blueprint file if the resource doesn't fit existing ones.
2. Register the new blueprint in `app.py` if it's a new file (TODO: confirm exact blueprint registration pattern used).
3. Use models from `backend/models/interview.py` to query/update MongoDB via MongoEngine.
4. Keep business logic (e.g., parsing, normalization) in `backend/services/` rather than in route handlers.

### Working with the Parsing Pipeline
Pipeline flow:
```
PDF Extractor (pdf_extractor.py)
      → Text Cleaning (Unicode/OCR repair, line merge)
      → Rule Parser (rule_parser.py)
      → Pipeline orchestration (pipeline.py)
      → Company Normalization (company_normalizer.py)
      → MongoDB Atlas
```

**Rule Parser — two-layer design:**
- **Layer 1 (Section Skip):** Detects round headers and buckets content as `technical`, `hr`, or `skip` (OA/Coding/Aptitude skipped for question extraction).
- **Layer 2 (Content Validation):** Validates candidate question lines via `_is_valid_question` (rejects advice/tips, bare titles, OA statements) and `_looks_like_question` (checks question "opener shape").

When modifying parser behavior:
1. Update logic in `rule_parser.py`.
2. Re-run `scripts/reprocess_from_pdfs.py` to reprocess existing PDFs with the updated parser, rather than relying on already-stored data.
3. Update `company_normalizer.py` if new company name variants need mapping to a canonical name.

### Adding/Modifying a Database Model
1. Edit `backend/models/interview.py`.
2. Update `DATABASE_SCHEMA.md` to reflect any field/relationship changes.
3. Confirm whether changes require reprocessing existing data via the reprocess script.

---

## Frontend Development

### Adding a New Page
1. Create a new component in `frontend/src/pages/`.
2. Register a route for it (TODO: confirm router configuration location — likely in `App.jsx` using React Router 6).
3. Reuse shared UI from `frontend/src/components/` where possible.

### Calling the Backend API
- All API calls go through `frontend/src/api/` using Axios.
- Base URL is configured via `VITE_API_BASE_URL` (e.g., `http://localhost:5000/api/v1` in development).
- TODO: confirm if there's a centralized Axios instance with interceptors for attaching Firebase auth tokens to requests.

### Managing Authentication State
- Auth state is managed via `frontend/src/context/` (TODO: confirm exact context name, e.g., `AuthContext`).
- Protected routes should check this context before rendering and redirect unauthenticated users to login.

### Styling
- Tailwind CSS 3 utility classes for styling.
- Lucide React for icons.

---

## Coding Conventions

TODO — Not explicitly documented. Recommended defaults (confirm with team):
- Backend: PEP8 for Python code; one blueprint per resource in `backend/api/`.
- Frontend: PascalCase for components, camelCase for functions/variables.
- Keep parsing/business logic out of route handlers — use `backend/services/`.

---

## Environment Variables

**Backend (`backend/.env`):**
```
MONGO_URI=TODO
SECRET_KEY=TODO
FIREBASE_CREDENTIALS=TODO
```

**Frontend (`frontend/.env`):**
```
VITE_API_BASE_URL=TODO
VITE_FIREBASE_API_KEY=TODO
VITE_FIREBASE_AUTH_DOMAIN=TODO
VITE_FIREBASE_PROJECT_ID=TODO
```

(Confirm exact variable names against each `.env.example`.)

---

## Testing

TODO — Testing is currently listed as "In Progress." No testing framework specified.

(See `TESTING_CHECKLIST.md` for planned testing items.)

---

## Known Areas Needing Work

Per current project status:
- **Parser Refinement** — improving accuracy of `rule_parser.py`, particularly question validation edge cases.
- **Deployment** — production deployment to Vercel (frontend) and Render (backend) not yet finalized.
- **UI Polish** — frontend still being refined.
- **Documentation** — in progress (this document set).

Per the README's "Future Improvements" section, planned (not yet built) features include: AI Interview Assistant (RAG), AI Resume Analyzer, Company Analytics, Bookmarks, Mock Interview Generator, Interview Timeline, Company Comparison, and Most Asked Questions — these are roadmap items, not current functionality.

---

## Contribution Workflow

Per the README:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

Code should follow existing conventions, and all functions should be documented.

---

## Notes

This guide reflects the current project state (~90–92% complete) and the structure/tooling described in the project README. Sections marked `TODO` should be confirmed directly against source files.