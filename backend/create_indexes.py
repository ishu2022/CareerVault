"""
create_indexes.py
─────────────────
Creates MongoDB indexes for production performance.
Run once after clean_data.py.

    python create_indexes.py

Safe to run multiple times — MongoDB ignores already-existing indexes.
"""

from dotenv import load_dotenv
load_dotenv()

import os
from pymongo import MongoClient, ASCENDING, TEXT

uri = os.getenv("MONGODB_URI")
client = MongoClient(uri)

# Get the database name from the URI, fall back to "careervault"
db_name = uri.split("/")[-1].split("?")[0] or "careervault"
db = client[db_name]
col = db["interviews"]

print(f"[indexes] Connected to database: {db_name}")
print(f"[indexes] Collection: interviews\n")

# ── Index 1: company (most-used filter) ─────────────────────────────────────
col.create_index([("company", ASCENDING)], name="idx_company")
print("✅  idx_company")

# ── Index 2: company + year (common compound query) ─────────────────────────
col.create_index(
    [("company", ASCENDING), ("year", ASCENDING)],
    name="idx_company_year"
)
print("✅  idx_company_year")

# ── Index 3: source_file unique (deduplication guard) ────────────────────────
col.create_index(
    [("source_file", ASCENDING)],
    unique=True,
    name="idx_source_file_unique"
)
print("✅  idx_source_file_unique (unique)")

# ── Index 4: full-text search on questions ───────────────────────────────────
# MongoDB text index — enables $text queries in search endpoint
col.create_index(
    [("rounds.questions", TEXT)],
    name="idx_questions_text"
)
print("✅  idx_questions_text (full-text)")

# ── Index 5: technologies (for filtering by tech stack later) ────────────────
col.create_index([("technologies", ASCENDING)], name="idx_technologies")
print("✅  idx_technologies")

# ── Index 6: year ────────────────────────────────────────────────────────────
col.create_index([("year", ASCENDING)], name="idx_year")
print("✅  idx_year")

# ── Show all indexes ─────────────────────────────────────────────────────────
print("\n[indexes] All indexes on interviews collection:")
for idx in col.list_indexes():
    print(f"  {idx['name']:35} keys={dict(idx['key'])}")

print("\n✅  All indexes created successfully.")
client.close()