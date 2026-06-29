# CareerVault API Documentation

## Overview

CareerVault exposes a REST API built with **Flask** and **MongoEngine**, organized into route blueprints under `backend/api/`. The API serves company, experience, question, and statistics data to the React frontend, and accepts new interview experience submissions.

**Base URL:** `http://localhost:5000/api/v1` (development)
**Production Base URL:** TODO (depends on Render deployment URL)

**Authentication:** Firebase Authentication. TODO: confirm exact mechanism for passing/verifying Firebase ID tokens on protected endpoints (e.g., contribute, delete).

---

## Table of Contents

- [Statistics](#statistics)
- [Companies](#companies)
- [Questions](#questions)
- [Contributions](#contributions)
- [Error Handling](#error-handling)

---

## Statistics

### Get Platform Statistics
```
GET /api/v1/stats
```
**Description:** Returns platform-wide statistics used by the Dashboard (total companies, experiences, questions, rounds).

**Response (example, shape TODO to confirm exactly):**
```json
{
  "total_companies": 25,
  "total_experiences": 120,
  "total_questions": 774,
  "total_rounds": 314
}
```

---

## Companies

### List All Companies
```
GET /api/v1/companies
```
**Description:** Returns a list of all companies with recorded interview experiences.

**Response:** TODO (exact shape not confirmed — likely an array of company names/summary objects)

---

### Get Company Detail
```
GET /api/v1/companies/:name
```
**Description:** Returns full detail for a company, including total experience count and all associated interview experiences (with rounds and questions nested).

**Path Parameters:**
| Parameter | Type | Description |
|----------|------|-------------|
| name | string | Company name (used as identifier instead of an ObjectId) |

**Response Example:**
```json
{
  "company": "Deutsche Bank",
  "total_experiences": 18,
  "experiences": [
    {
      "id": "64f3a...",
      "role": "Software Engineer",
      "year": "2024",
      "difficulty": "medium",
      "outcome": "selected",
      "rounds": [
        {
          "round_type": "technical",
          "questions": [
            "What is virtual memory?",
            "Explain the pillars of OOP.",
            "Difference between Java and C++."
          ]
        },
        {
          "round_type": "hr",
          "questions": [
            "Tell me about yourself.",
            "Why Deutsche Bank?"
          ]
        }
      ]
    }
  ]
}
```

---

## Questions

### Search Questions
```
GET /api/v1/questions/search?q=<query>
```
**Description:** Searches questions across all companies and rounds.

**Query Parameters:**
| Parameter | Type | Description |
|----------|------|-------------|
| q | string | Search term |

**Response:** TODO (exact shape not confirmed — likely an array of matching question objects, each referencing company/round context)

---

## Contributions

### Submit Interview Experience
```
POST /api/v1/contribute
```
**Description:** Allows a student to submit a new interview experience through the Contribute page. Submissions are processed through the ingestion pipeline (extraction → parsing → cleaning → storage), though the exact flow for manually-submitted (non-PDF) data vs. uploaded PDFs is TODO to confirm.

**Request Body:** TODO (exact fields not confirmed — likely includes company, role, year, difficulty, outcome, rounds, questions, tips)

**Response:** TODO

---

### Delete Interview Experience (Admin)
```
DELETE /api/v1/contribute/:id
```
**Description:** Deletes a previously submitted interview experience. Marked as an admin action.

**Path Parameters:**
| Parameter | Type | Description |
|----------|------|-------------|
| id | string | Interview experience identifier |

**Authorization:** TODO (confirm admin-only access control mechanism)

**Response:** TODO

---

## Error Handling

**Standard Error Response Format:** TODO

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found (e.g., company not found) |
| 500 | Internal Server Error |

---

## Notes

- Company lookups use the company **name** as the identifier (`/companies/:name`) rather than a database ID, per the README's example response.
- Endpoint paths are versioned under `/api/v1/`.
- Several response shapes and request body fields remain `TODO` pending confirmation from the actual route implementations in `backend/api/`.