# CareerVault User Guide

## Overview

CareerVault helps students prepare for placements by providing real interview experiences collected from previous candidates. This guide walks through how to use the platform's features.

---

## 1. Getting Started

### 1.1 Login
- Navigate to the CareerVault login page.
- Sign in using Firebase Authentication (TODO: confirm supported login methods — e.g., email/password, Google sign-in).
- Once logged in, you'll be redirected to the **Dashboard**.

### 1.2 Logout
- Use the logout option (TODO: confirm exact location, e.g., navbar/profile menu) to end your session.

### 1.3 Protected Routes
- Certain pages require login. Attempting to access them while logged out redirects you to the login page.

---

## 2. Dashboard

After logging in, the Dashboard displays live statistics:
- **Total Companies** — 25+
- **Total Interview Experiences** — 120+ (from processed PDFs)
- **Total Questions** — 774+
- **Total Rounds** — 314+

This gives you an at-a-glance overview of the entire knowledge base.

---

## 3. Browsing Companies

### 3.1 Companies Page
- Browse all companies with recorded interview experiences.
- Click a company to open its detail page.

### 3.2 Searching Companies
- Use the search bar to quickly find a company by name.

### 3.3 Company Detail Page
For each company, you'll see:
- Total number of recorded interview experiences for that company
- Each experience's role, year, difficulty, and outcome
- Round-by-round breakdown (Technical, HR, OA, Coding)

---

## 4. Viewing Interview Experiences

Each interview experience includes:
- **Role & Year** — the position interviewed for and when
- **Technical Round** — questions and discussion topics
- **HR Round** — behavioral/HR questions
- **OA / Coding Rounds** — online assessment and coding round info (note: per the parsing pipeline, OA/coding sections are not used for question extraction, so detailed questions from these rounds may be limited — TODO confirm what's shown for these round types)
- **Difficulty** — e.g., easy / medium / hard
- **Outcome** — e.g., selected / rejected
- **Tips** — preparation tips extracted from the original submission

---

## 5. Searching

### 5.1 Search Companies
Find companies by name to quickly jump to their interview experiences.

### 5.2 Search Questions
Search across all 774+ recorded questions to find specific topics, technologies, or question types you want to prepare for — useful for targeted, company-agnostic practice.

---

## 6. Contributing an Interview Experience

If you've recently interviewed at a company, you can contribute your experience:

1. Go to the **Contribute** page.
2. Fill in your interview details (TODO: confirm exact form fields — likely company, role, year, difficulty, outcome, round-by-round questions, and tips).
3. Submit the form.
4. Your experience is processed and added to help future students.

---

## 7. Administration: Deleting an Experience

TODO: confirm which users have permission to delete interview experiences (marked as an admin action in the API).

To delete an interview experience:
1. Navigate to the relevant experience.
2. Use the delete option (TODO: confirm exact UI location).
3. Confirm deletion.

---

## 8. Tips for Getting the Most Out of CareerVault

- Use **Search Questions** to focus prep on commonly asked topics across companies.
- Check **difficulty** and **outcome** fields to gauge how challenging a company's process tends to be.
- Read the **tips** section in each experience for first-hand advice from previous candidates.
- Browse a target company's full list of experiences to spot recurring question patterns across multiple candidates.
- Contribute your own experience after interviews to help other students.

---

## 9. What's Coming Next

Per the project roadmap, planned future features include: an AI Interview Assistant, AI Resume Analyzer, Company Analytics, Bookmarks, a Mock Interview Generator, Interview Timelines, Company Comparison, and Most Asked Questions lists. These are **not yet available** in the current version.

---

## Notes

This guide reflects currently completed features (~90–92% project completion). Some UI details and exact form fields are marked `TODO` where not specified, and should be updated as the UI is finalized.