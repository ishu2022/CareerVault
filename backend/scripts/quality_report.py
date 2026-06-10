"""
quality_report.py
─────────────────
Prints a full data quality report to console.
Run after clean_data.py.

    python quality_report.py
"""

from dotenv import load_dotenv
load_dotenv()

import os
from mongoengine import connect
from collections import Counter, defaultdict

connect(host=os.getenv("MONGODB_URI"))

from models.interview import InterviewExperience

docs = list(InterviewExperience.objects())

print()
print("=" * 60)
print("  CAREERVAULT — DATA QUALITY REPORT")
print("=" * 60)

# ── 1. Overview ──────────────────────────────────────────────────
total_docs       = len(docs)
total_companies  = len({d.company for d in docs})
total_rounds     = sum(len(d.rounds) for d in docs)
total_questions  = sum(
    len(r.questions)
    for d in docs
    for r in d.rounds
)

print(f"\n📊 OVERVIEW")
print(f"  Total interview documents : {total_docs}")
print(f"  Unique companies          : {total_companies}")
print(f"  Total rounds parsed       : {total_rounds}")
print(f"  Total questions extracted : {total_questions}")
avg_q = round(total_questions / total_docs, 1) if total_docs else 0
print(f"  Avg questions per doc     : {avg_q}")

# ── 2. Documents per company ─────────────────────────────────────
print(f"\n🏢 DOCUMENTS PER COMPANY")
company_counts = Counter(d.company for d in docs)
for company, count in company_counts.most_common():
    bar = "█" * count
    print(f"  {company:<30} {count:>3}  {bar}")

# ── 3. Questions per company ──────────────────────────────────────
print(f"\n❓ QUESTIONS PER COMPANY (total extracted)")
q_by_company = defaultdict(int)
for d in docs:
    for r in d.rounds:
        q_by_company[d.company] += len(r.questions)

for company, count in sorted(q_by_company.items(), key=lambda x: -x[1]):
    print(f"  {company:<30} {count:>4} questions")

# ── 4. Round type breakdown ───────────────────────────────────────
print(f"\n🔄 ROUND TYPES")
round_counts = Counter()
for d in docs:
    for r in d.rounds:
        round_counts[r.round_type or "unknown"] += 1
for rtype, count in round_counts.most_common():
    print(f"  {rtype:<20} {count}")

# ── 5. Year distribution ──────────────────────────────────────────
print(f"\n📅 YEAR DISTRIBUTION")
year_counts = Counter(d.year or "unknown" for d in docs)
for year, count in sorted(year_counts.items()):
    print(f"  {year:<10} {count}")

# ── 6. Difficulty distribution ───────────────────────────────────
print(f"\n⚡ DIFFICULTY")
diff_counts = Counter(d.difficulty or "unknown" for d in docs)
for diff, count in diff_counts.most_common():
    print(f"  {diff:<10} {count}")

# ── 7. Outcome distribution ───────────────────────────────────────
print(f"\n🎯 OUTCOME")
outcome_counts = Counter(d.outcome or "unknown" for d in docs)
for outcome, count in outcome_counts.most_common():
    print(f"  {outcome:<10} {count}")

# ── 8. Data quality issues ───────────────────────────────────────
print(f"\n⚠️  DATA QUALITY ISSUES")

no_rounds     = [d for d in docs if not d.rounds]
no_year       = [d for d in docs if not d.year or d.year == "unknown"]
no_questions  = [d for d in docs if all(not r.questions for r in d.rounds)]
still_unknown = [d for d in docs if d.company == "Unknown"]

print(f"  Documents with no rounds parsed      : {len(no_rounds)}")
print(f"  Documents with no year               : {len(no_year)}")
print(f"  Documents with 0 questions extracted : {len(no_questions)}")
print(f"  Documents still 'Unknown' company    : {len(still_unknown)}")

if still_unknown:
    print("  Unknown company files:")
    for d in still_unknown:
        print(f"    - {d.source_file}")

print("\n" + "=" * 60)
print("  Report complete")
print("=" * 60)