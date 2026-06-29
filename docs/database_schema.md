# CareerVault Database Schema

## Overview

CareerVault uses **MongoDB** as its database, accessed via **MongoEngine** (Python ODM) in the Flask backend. Data is organized around Companies, Interview Experiences, Rounds, and Questions.

---

## Current Data Volume

| Entity | Count |
|--------|-------|
| Companies | 25+ |
| Interview Experiences | 120+ |
| Interview Rounds | 314+ |
| Questions | 774+ |

---

## Entity Relationship Overview

```
Company
  └── InterviewExperience (many per company)
        └── Round (many per experience: Technical / HR / OA)
              └── Question (many per round)
```

---

## Collections

### 1. Company

**Description:** Represents a company for which interview experiences exist.

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Company name |
| TODO | TODO | TODO (additional fields not specified, e.g. logo, industry) |

**Relationships:**
- One Company → Many Interview Experiences

---

### 2. InterviewExperience

**Description:** Represents a single candidate's interview experience at a company.

| Field | Type | Description |
|-------|------|--------------|
| _id | ObjectId | Unique identifier |
| company | Reference (Company) | Linked company |
| difficulty | String | Interview difficulty (e.g., Easy/Medium/Hard) — TODO confirm exact values |
| outcome | String | Interview outcome (e.g., Selected/Rejected) — TODO confirm exact values |
| tips | String | Preparation tips shared by the candidate |
| rounds | List[Reference(Round)] | Associated interview rounds |
| TODO | TODO | TODO (e.g., submission date, candidate name/anonymity, source PDF reference) |

**Relationships:**
- Many Interview Experiences → One Company
- One Interview Experience → Many Rounds

---

### 3. Round

**Description:** Represents a single round within an interview experience (Technical, HR, or OA).

| Field | Type | Description |
|-------|------|--------------|
| _id | ObjectId | Unique identifier |
| experience | Reference (InterviewExperience) | Linked interview experience |
| type | String | Round type: `Technical`, `HR`, or `OA` |
| questions | List[Reference(Question)] | Questions asked in this round |
| TODO | TODO | TODO (e.g., round order/sequence, duration) |

**Relationships:**
- Many Rounds → One Interview Experience
- One Round → Many Questions

---

### 4. Question

**Description:** Represents a single question asked during a round.

| Field | Type | Description |
|-------|------|--------------|
| _id | ObjectId | Unique identifier |
| round | Reference (Round) | Linked round |
| text | String | The question text |
| TODO | TODO | TODO (e.g., question category/topic, difficulty) |

**Relationships:**
- Many Questions → One Round

---

## Indexes

TODO — Not specified. Likely candidates based on current features:
- Company `name` (used for search/browse)
- Question `text` (used for question search)

---

## Notes on Schema Design

- Schema is inferred from the described features (Technical/HR/OA rounds, difficulty, outcome, questions, tips) and the stated database counts (Companies, Interview Experiences, Rounds, Questions).
- Exact MongoEngine field types (e.g., `StringField`, `ReferenceField`, `ListField`), validation rules, and any additional metadata fields are **not provided** and are marked `TODO`.
- Actual model files are located in `backend/models/` (file names not provided — TODO).

---

## Status

Schema reflects the current production data (~90–92% project completion). Parser refinement may still affect schema fields, per current project status.