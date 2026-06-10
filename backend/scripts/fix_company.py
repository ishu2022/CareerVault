"""
fix_company_names.py
────────────────────
One-time script to normalise company names in existing MongoDB documents.
Run this ONCE to fix the 120 documents already in the database.

Usage:
    cd backend/
    python fix_company_names.py
"""

from dotenv import load_dotenv
load_dotenv()

import os
from mongoengine import connect
connect(host=os.getenv('MONGODB_URI'))
print("[init] MongoDB connected\n")

from models.interview import InterviewExperience
from services.company_normalizer import normalize_company_name

# ── Show before state ─────────────────────────────────────────────
pipeline = [
    {"$group": {"_id": "$company", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
print("BEFORE — current company names in MongoDB:")
for r in InterviewExperience.objects.aggregate(pipeline):
    print(f"  {r['_id']:<35} ({r['count']} docs)")

# ── Fix each document ─────────────────────────────────────────────
print("\nNormalising...")
fixed   = 0
skipped = 0

for doc in InterviewExperience.objects():
    normalised = normalize_company_name(doc.company)
    if normalised != doc.company:
        print(f"  {doc.company!r:35} → {normalised!r}")
        doc.company = normalised
        doc.save()
        fixed += 1
    else:
        skipped += 1

print(f"\nFixed: {fixed} | Already correct: {skipped}")

# ── Show after state ──────────────────────────────────────────────
print("\nAFTER — normalised company names in MongoDB:")
for r in InterviewExperience.objects.aggregate(pipeline):
    print(f"  {r['_id']:<35} ({r['count']} docs)")