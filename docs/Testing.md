# CareerVault Testing Checklist

## Overview

This checklist covers manual and automated testing items for CareerVault. Testing is currently listed as **In Progress** in the project status, so this document serves as a working checklist rather than a record of completed test coverage.

---

## 1. Authentication

- [ ] User can log in via Firebase Authentication
- [ ] User can log out successfully
- [ ] Invalid login credentials show an appropriate error
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Authenticated users can access protected routes
- [ ] Session persists correctly on page refresh (TODO: confirm expected behavior)

---

## 2. Dashboard

- [ ] Dashboard loads after login
- [ ] Total Companies count matches `/api/v1/stats` response (expected: 25+)
- [ ] Total Experiences count matches `/api/v1/stats` response (expected: 120+)
- [ ] Total Questions count matches `/api/v1/stats` response (expected: 774+)
- [ ] Total Rounds count matches `/api/v1/stats` response (expected: 314+)
- [ ] Dashboard handles loading/empty states gracefully

---

## 3. Companies

- [ ] Companies page lists all companies (25+ expected)
- [ ] Clicking a company navigates to `/companies/:name` detail page
- [ ] Company Detail page shows correct `total_experiences` count for that company
- [ ] Company Detail page lists all experiences with role, year, difficulty, outcome, and rounds
- [ ] Search Companies returns correct matching results
- [ ] Search Companies handles no-match case gracefully
- [ ] Search Companies handles partial/case-insensitive matches (TODO: confirm expected behavior)
- [ ] Company name normalization works correctly (e.g., variant spellings map to the same canonical company via `company_normalizer.py`)

---

## 4. Interview Experience Data

- [ ] Technical Round questions display correctly
- [ ] HR Round questions display correctly
- [ ] OA / Coding round data displays correctly (even if no extracted questions, per parser's "skip" bucketing)
- [ ] Difficulty field displays correctly (e.g., `easy`/`medium`/`hard`)
- [ ] Outcome field displays correctly (e.g., `selected`/`rejected`)
- [ ] Role and year fields display correctly
- [ ] Tips section displays correctly
- [ ] Experience with missing/partial data handled gracefully (TODO: confirm fallback UI)

---

## 5. PDF Parsing Pipeline

- [ ] `pdf_extractor.py` correctly extracts text using pdfplumber for standard PDFs
- [ ] PyMuPDF fallback activates correctly when pdfplumber fails/produces poor output
- [ ] Text cleaning correctly handles Unicode normalization and OCR artifact repair
- [ ] Line merging correctly reconstructs broken lines from PDF extraction
- [ ] **Layer 1 (Section Skip):** Round headers are correctly detected and bucketed as `technical`, `hr`, or `skip`
- [ ] OA/Coding/Aptitude sections are correctly excluded from question extraction
- [ ] **Layer 2 (Validation):** `_is_valid_question` correctly rejects advice/tips text
- [ ] `_is_valid_question` correctly rejects bare section titles
- [ ] `_is_valid_question` correctly rejects OA-related statements
- [ ] `_looks_like_question` correctly validates question "opener shape"
- [ ] Valid questions are correctly stored after passing both layers
- [ ] `company_normalizer.py` correctly maps company name variants to canonical names
- [ ] `pipeline.py` correctly deduplicates repeated questions/experiences
- [ ] `scripts/reprocess_from_pdfs.py` successfully reprocesses existing PDFs without data corruption/duplication

---

## 6. Search

- [ ] Search Questions (`/api/v1/questions/search?q=`) returns relevant results
- [ ] Search Questions handles no-match case gracefully
- [ ] Search performance is acceptable with current dataset (774+ questions)

---

## 7. Contribution

- [ ] Contribute Page form renders correctly
- [ ] Required fields are validated before submission
- [ ] Successful submission (`POST /api/v1/contribute`) adds data to MongoDB Atlas
- [ ] Submission errors are handled and shown to the user
- [ ] TODO: confirm if contributed data requires review/approval before being publicly visible
- [ ] TODO: confirm if contributed data goes through the same parsing pipeline as uploaded PDFs, or a separate manual-entry path

---

## 8. Administration (Delete Experience)

- [ ] `DELETE /api/v1/contribute/:id` removes the experience from the database
- [ ] Delete action updates Dashboard stats accordingly
- [ ] Delete action requires correct permissions (TODO: confirm admin-only access control implementation)
- [ ] Confirmation step exists before deletion (TODO: confirm UX)

---

## 9. Backend API Testing

- [ ] All `/api/v1/*` endpoints return correct status codes for success cases
- [ ] All endpoints return correct status codes/messages for error cases (e.g., company not found → 404)
- [ ] Endpoints requiring authentication reject unauthenticated requests
- [ ] Endpoints handle invalid/missing parameters gracefully
- [ ] TODO: confirm if automated API tests (e.g., pytest) exist or are planned

---

## 10. Frontend UI/UX

- [ ] Responsive design works across desktop and mobile (TODO: confirm target breakpoints)
- [ ] Navigation between pages (React Router 6) works without errors
- [ ] Loading states are shown during API calls
- [ ] Error states are shown when API calls fail
- [ ] Lucide React icons render correctly across pages
- [ ] Tailwind styling is consistent across pages

---

## 11. Cross-Browser / Cross-Device Testing

- [ ] TODO: confirm target browsers (e.g., Chrome, Firefox, Safari, Edge)
- [ ] TODO: confirm target devices (desktop, tablet, mobile)

---

## 12. Performance

- [ ] Dashboard stats load within acceptable time (TODO: define threshold)
- [ ] Question search returns within acceptable time across 774+ questions (TODO: define threshold)
- [ ] Large dataset (120+ experiences, 314+ rounds) does not cause UI lag on Company Detail pages

---

## 13. Security

- [ ] Unauthorized users cannot access protected API endpoints (e.g., contribute delete)
- [ ] Firebase tokens are validated correctly on the backend (TODO: confirm implementation)
- [ ] Input fields are sanitized to prevent injection attacks
- [ ] Sensitive config values (Mongo URI, Firebase keys) are not exposed in frontend code or committed to the repo

---

## Notes

This checklist is based on currently completed features, the documented parser architecture, and known in-progress areas (Testing, UI Polish, Parser Refinement). Items marked `TODO` require confirmation of expected behavior before they can be fully tested.