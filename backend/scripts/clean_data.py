"""
clean_data.py
─────────────
Step 1 of production prep.
- Normalises all company names in MongoDB (fixes HSBC/Hsbc, DE Shaw/De Shaw, etc.)
- Removes duplicate documents (keeps the oldest, deletes newer copies)
- Prints a before/after report

Run from backend/ folder:
    python clean_data.py

Safe to run multiple times — idempotent.
"""

from dotenv import load_dotenv
load_dotenv()

import os
from mongoengine import connect
from collections import defaultdict

connect(host=os.getenv("MONGODB_URI"))
print("[clean] MongoDB connected\n")

from models.interview import InterviewExperience

# ─────────────────────────────────────────────────────────────────────────────
# COMPANY NAME NORMALISATION MAP
# Key   = any variant found in your data (lowercased for matching)
# Value = the canonical name to store
# ─────────────────────────────────────────────────────────────────────────────
COMPANY_CANONICAL = {
    # Deutsche Bank variants
    "deustche bank":        "Deutsche Bank",
    "deutsche bank":        "Deutsche Bank",
    "deutschebank":         "Deutsche Bank",
    "db":                   "Deutsche Bank",

    # Goldman Sachs
    "goldman sachs":        "Goldman Sachs",
    "goldman":              "Goldman Sachs",
    "gs":                   "Goldman Sachs",

    # JPMC
    "jpmc":                 "JPMorgan Chase",
    "jp morgan":            "JPMorgan Chase",
    "jpmorgan":             "JPMorgan Chase",
    "j.p. morgan":          "JPMorgan Chase",

    # BNY Mellon  — "BNY" and "BNY Mellon" are the same company
    "bny mellon":           "BNY Mellon",
    "bny":                  "BNY Mellon",
    "bank of new york":     "BNY Mellon",

    # HSBC
    "hsbc":                 "HSBC",
    "hsbc bank":            "HSBC",

    # DE Shaw
    "de shaw":              "D.E. Shaw",
    "d.e. shaw":            "D.E. Shaw",
    "de shaw & co":         "D.E. Shaw",
    "deshaw":               "D.E. Shaw",

    # Hilti
    "hilti":                "Hilti",
    "htsi":                 "Hilti",

    # SAP
    "sap":                  "SAP",
    "sap labs":             "SAP",

    # Citi
    "citi":                 "Citi",
    "citibank":             "Citi",
    "citicorp":             "Citi",
    "citigroup":            "Citi",

    # Oracle
    "oracle":               "Oracle",

    # Google
    "google":               "Google",

    # Morgan Stanley
    "morgan stanley":       "Morgan Stanley",

    # Texas Instruments
    "texas instruments":    "Texas Instruments",
    "ti":                   "Texas Instruments",

    # Bank of America
    "bank of america":      "Bank of America",
    "bofa":                 "Bank of America",

    # Wells Fargo
    "wells fargo":          "Wells Fargo",

    # Dolat Capital
    "dolat capital":        "Dolat Capital",

    # NPCI
    "npci":                 "NPCI",

    # Tracelink
    "tracelink":            "Tracelink",

    # PWC
    "pwc":                  "PwC",
    "pricewaterhousecoopers": "PwC",

    # Mahindra Finance
    "mahindra finance":     "Mahindra Finance",
    "mahindra":             "Mahindra Finance",

    # P&G
    "proctor & gamble":     "Procter & Gamble",
    "p&g":                  "Procter & Gamble",
    "procter & gamble":     "Procter & Gamble",

    # UBS
    "ubs":                  "UBS",

    # Unknown stays unknown
    "unknown":              "Unknown",
}


def normalise_company(raw_name: str) -> str:
    """Return canonical company name for any raw variant."""
    if not raw_name:
        return "Unknown"
    lookup = raw_name.strip().lower()
    return COMPANY_CANONICAL.get(lookup, raw_name.strip().title())


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Normalise company names
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
print("STEP 1: Normalising company names")
print("=" * 60)

all_docs  = InterviewExperience.objects()
fixed     = 0
unchanged = 0

for doc in all_docs:
    canonical = normalise_company(doc.company)
    if canonical != doc.company:
        print(f"  {doc.company!r:30} → {canonical!r}")
        doc.company = canonical
        doc.save()
        fixed += 1
    else:
        unchanged += 1

print(f"\n  Fixed:     {fixed}")
print(f"  Unchanged: {unchanged}")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Remove duplicates
# Strategy: group by source_file — if multiple docs share the same
# source_file, keep the OLDEST (first inserted) and delete the rest.
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 2: Removing duplicates")
print("=" * 60)

# Group by source_file
groups = defaultdict(list)
for doc in InterviewExperience.objects().order_by("created_at"):
    groups[doc.source_file].append(doc)

total_deleted = 0
for source_file, docs in groups.items():
    if len(docs) > 1:
        keeper   = docs[0]   # oldest — keep this
        to_delete = docs[1:]  # rest — delete these
        print(f"  Duplicate: {source_file!r} — keeping id={keeper.id}, deleting {len(to_delete)}")
        for d in to_delete:
            d.delete()
            total_deleted += 1

print(f"\n  Deleted {total_deleted} duplicate documents")


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Fix 'Unknown' companies using rule_parser fallback
# If company == "Unknown" and raw_text exists, try to detect from text
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("STEP 3: Re-detecting Unknown companies from raw_text")
print("=" * 60)

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from services.rule_parser import extract_company

unknown_docs = InterviewExperience.objects(company="Unknown")
re_identified = 0

for doc in unknown_docs:
    if doc.raw_text:
        detected = extract_company(doc.raw_text)
        if detected != "Unknown":
            canonical = normalise_company(detected)
            print(f"  {doc.source_file!r} → detected as {canonical!r}")
            doc.company = canonical
            doc.save()
            re_identified += 1

print(f"\n  Re-identified {re_identified} Unknown documents")

print("\n✅ Cleaning complete!")
print(f"   Total documents now: {InterviewExperience.objects.count()}")