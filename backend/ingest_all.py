"""
ingest_all.py
─────────────
Run once to batch-process all 2023-2025 PDFs from Google Drive.

Usage:
    cd backend/
    python ingest_all.py

Processes in batches of 20 to avoid memory buildup.
Prints a full summary at the end.
"""

from dotenv import load_dotenv
load_dotenv()

import os
import time
from mongoengine import connect

connect(host=os.getenv('MONGODB_URI'))
print("[init] MongoDB connected\n")

from services.drive_services import sync_drive_to_uploads
from services.pipeline import run_pipeline

# ── Config ────────────────────────────────────────────────────────
BATCH_SIZE = 20     # files per batch
SLEEP_SEC  = 1      # pause between batches (gentle on Drive API)

# ── Scan Drive ────────────────────────────────────────────────────
print("[ingest] Scanning Google Drive for 2023-2025 PDFs...")
all_files = sync_drive_to_uploads()
print(f"[ingest] {len(all_files)} files ready to process\n")

# ── Batch loop ────────────────────────────────────────────────────
saved   = []
skipped = []
failed  = []

for i in range(0, len(all_files), BATCH_SIZE):
    batch = all_files[i: i + BATCH_SIZE]
    print(f"\n{'─' * 50}")
    print(f"Batch {i // BATCH_SIZE + 1} — files {i+1} to {i+len(batch)}")
    print(f"{'─' * 50}")

    for file_info in batch:
        result = run_pipeline(
            pdf_path      = file_info['path'],
            original_name = file_info['name'],
            company_hint  = file_info.get('company_hint', 'Unknown'),
            year_hint     = file_info.get('year_hint'),
        )

        if result.get('error'):
            failed.append({'file': file_info['name'], 'error': result['error']})
        elif result.get('skipped'):
            skipped.append(file_info['name'])
        else:
            saved.append(result)

    if i + BATCH_SIZE < len(all_files):
        print(f"\n[ingest] Batch done — sleeping {SLEEP_SEC}s...")
        time.sleep(SLEEP_SEC)

# ── Summary ───────────────────────────────────────────────────────
print(f"\n{'═' * 50}")
print(f"  INGESTION COMPLETE")
print(f"{'═' * 50}")
print(f"  ✓ Saved to MongoDB : {len(saved)}")
print(f"  ⏭  Skipped (dupes)  : {len(skipped)}")
print(f"  ✗ Failed            : {len(failed)}")
print(f"{'═' * 50}")

if failed:
    print("\nFailed files:")
    for f in failed:
        print(f"  - {f['file']}: {f['error']}")

if saved:
    from collections import Counter
    companies = Counter(r['company'] for r in saved)
    print("\nDocuments saved by company:")
    for company, count in companies.most_common():
        print(f"  {company:<35} {count}")