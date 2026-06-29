# CareerVault Folder Structure

## Overview

This document provides a detailed breakdown of the CareerVault repository structure, including the purpose of each major file and folder.

---

## Full Project Tree

```
CareerVault/
│
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

## Folder & File Descriptions

### `backend/`

Root of the Flask backend application.

#### `backend/api/`
Contains Flask route blueprints, one per resource:

| File | Purpose |
|------|---------|
| `companies.py` | Endpoints for listing and retrieving company data |
| `experiences.py` | Endpoints related to individual interview experiences |
| `questions.py` | Endpoint for searching questions across experiences |
| `stats.py` | Endpoint for platform-wide dashboard statistics |
| `contribute.py` | Endpoints for submitting and deleting interview experiences |

#### `backend/models/`
| File | Purpose |
|------|---------|
| `interview.py` | MongoEngine document model definitions (Company/Experience/Round/Question structures — see `DATABASE_SCHEMA.md`) |

#### `backend/services/`
Core business logic, kept separate from route handlers:

| File | Purpose |
|------|---------|
| `pdf_extractor.py` | Extracts raw text from PDFs (pdfplumber primary, PyMuPDF fallback) |
| `rule_parser.py` | Custom rule-based NLP parser — detects rounds, validates and extracts questions, identifies difficulty/outcome |
| `pipeline.py` | Orchestrates the full ingestion flow: extraction → cleaning → parsing → normalization → storage |
| `company_normalizer.py` | Maps raw/variant company name strings to a single canonical name |

#### `backend/scripts/`
| File | Purpose |
|------|---------|
| `reprocess_from_pdfs.py` | Batch script to reprocess all previously uploaded PDFs (e.g., after parser updates) |

#### `backend/uploads/`
Storage location for uploaded interview experience PDF files.

#### `backend/app.py`
Flask application entry point — initializes the app, registers blueprints, and starts the server.

#### `backend/requirements.txt`
Python dependency list (Flask, MongoEngine, pdfplumber, PyMuPDF, wordninja, etc.).

---

### `frontend/`

Root of the React + Vite frontend application.

#### `frontend/src/components/`
Reusable UI building blocks shared across multiple pages (e.g., cards, buttons, nav bar — TODO: confirm exact component inventory).

#### `frontend/src/pages/`
Route-level page components — Dashboard, Companies, Company Detail, Search, Contribute, Login, etc. (TODO: confirm exact page file names).

#### `frontend/src/context/`
React Context providers, including authentication state (TODO: confirm exact context name, e.g., `AuthContext`).

#### `frontend/src/api/`
Axios-based service layer for calling backend REST endpoints.

#### `frontend/src/assets/`
Static assets (images, icons not covered by Lucide React, etc.).

#### `frontend/index.html`
HTML entry point for the Vite application.

#### `frontend/vite.config.js`
Vite build/dev server configuration.

#### `frontend/tailwind.config.js`
Tailwind CSS configuration (theme, content paths, etc.).

#### `frontend/package.json`
Frontend dependency list and npm scripts.

---

### `README.md`
Top-level project overview, feature list, tech stack, architecture diagrams, installation steps, API reference, and roadmap.

---

## Notes

- This structure reflects the project as documented in the current README.
- Some sub-paths (exact component/page file names, `.env.example` contents) are not fully enumerated and are marked `TODO` where applicable.
- Do not invent files beyond what's listed here — confirm against the actual repository before relying on any unlisted path.