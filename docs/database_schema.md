# CareerVault Database Schema

## Overview

CareerVault uses **MongoDB Atlas** as its database, accessed via **MongoEngine** in the Flask backend. The primary model definitions live in `backend/models/interview.py`.

---

## Current Data Volume

| Entity | Count |
|--------|-------|
| Companies | 25+ |
| Interview Experiences (PDFs processed) | 120+ |
| Interview Rounds | 314+ |
| Questions | 774+ |

---

## Entity Relationship Overview

```
Company
  └── InterviewExperience (many per company)
        └── Round (technical / hr / oa / coding)
              └── Question (many per round)
```

Note: Based on the API example response, **Rounds and Questions appear to be embedded within the InterviewExperience document** rather than stored as fully separate top-level collections with their own ObjectIds — TODO: confirm whether `Round` and `Question` are embedded documents (`EmbeddedDocumentField`) or referenced documents (`ReferenceField`) in `interview.py`.

---

## Collections / Documents

### 1. Company

**Description:** Represents a company with one or more recorded interview experiences. Companies appear to be identified by **name** rather than a separate ID in API responses (`/companies/:name`), suggesting company name may be stored directly on each experience and "Company" may be a normalized/derived view rather than its own collection — TODO: confirm if a standalone `Company` collection exists or if companies are derived from distinct `company` values on `InterviewExperience`.

| Field | Type | Description |
|-------|------|-------------|
| name | String | Canonical company name (normalized via `company_normalizer.py`) |
| TODO | TODO | Additional fields (e.g., industry, logo) not confirmed |

---

### 2. InterviewExperience

**Description:** Represents a single candidate's interview experience at a company.

| Field | Type | Description |
|-------|------|--------------|
| id | ObjectId | Unique identifier (shown as `"id": "64f3a..."` in API example) |
| company | String / Reference | Company name this experience belongs to |
| role | String | Job role interviewed for (e.g., `"Software Engineer"`) |
| year | String | Year of the interview (e.g., `"2024"`) |
| difficulty | String | Interview difficulty (e.g., `"medium"`) |
| outcome | String | Interview outcome (e.g., `"selected"`) |
| rounds | List[Round] | Embedded or referenced rounds (technical, hr, oa, coding) |
| tips | String | Preparation tips extracted from the source PDF — TODO: confirm field presence in schema vs. only in raw text |
| source_pdf | String | TODO — likely reference to original uploaded PDF filename/path |
| created_at | DateTime | TODO — submission/processing timestamp |

---

### 3. Round (embedded within InterviewExperience — TODO confirm)

**Description:** Represents a single round within an interview experience.

| Field | Type | Description |
|-------|------|--------------|
| round_type | String | One of: `technical`, `hr`, `oa`, `coding` (per parser's Layer 1 bucketing) |
| questions | List[String] | List of question text strings for this round |

Per the parser architecture, `oa`/`coding`/`aptitude` sections are bucketed as `skip` for **question extraction**, meaning these round types may exist with empty or minimal `questions` lists — TODO: confirm how OA/Coding rounds are represented when no questions are extracted from them.

---

### 4. Question

**Description:** In the current example schema, questions appear as plain strings within a round's `questions` array rather than as a separate document with its own fields.

| Field | Type | Description |
|-------|------|--------------|
| text | String | The question text |
| TODO | TODO | TODO — confirm if questions are ever stored as richer objects (e.g., with category/topic tags) for the Search Questions feature |

**Note:** The project status separately tracks "774+ Questions" as a count, implying questions may also be indexed/aggregated separately (e.g., for the search feature) even if nested under rounds in the experience document — TODO: confirm if a denormalized/flat `Question` collection exists for search performance.

---

## Validation Rules (Parser-Enforced)

The rule parser (`rule_parser.py`) applies validation before a line is stored as a question:
- Rejects advice/tips text
- Rejects bare section titles
- Rejects OA-related statements that are not actual questions
- Requires the line to pass an "opener shape" check (`_looks_like_question`)

This means stored `Question` data has already passed content filtering at ingestion time, rather than being raw extracted text.

---

## Indexes

TODO — Not specified. Likely candidates given current features:
- `company` field on `InterviewExperience` (used for company lookup/search)
- Text index on question strings (used for Search Questions)

---

## Notes on Schema Design

- Exact MongoEngine field types (e.g., `StringField`, `EmbeddedDocumentField`, `ReferenceField`, `ListField`) are inferred from the API example response in the README and are **not confirmed** against the actual `backend/models/interview.py` file.
- Sections marked `TODO` should be verified directly against the model source code.

---

## Status

Schema reflects current production data (~90–92% project completion). Parser refinement may still affect schema fields.