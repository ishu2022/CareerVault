import sys
import os
import argparse
from mongoengine import connect

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.db import connect_db

connect_db()

from services.pdf_extractor import extract_text
from services.rule_parser import (
    clean_text,
    merge_wrapped_lines,
    extract_rounds_with_questions,
)


DEFAULT_PDF_DIRS = [
    "uploads",
    os.path.join("uploads", "pdfs"),
    "data",
    "drive_downloads",
]


def find_pdf_path(source_file: str, search_dirs):
    """
    Locate the original PDF on disk using source_file.
    Tries each search_dir, then falls back to a recursive search
    rooted at the project base directory.
    """
    if not source_file:
        return None

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    for d in search_dirs:
        candidate = d if os.path.isabs(d) else os.path.join(base_dir, d)
        direct = os.path.join(candidate, source_file)
        if os.path.isfile(direct):
            return direct

    for d in search_dirs:
        candidate = d if os.path.isabs(d) else os.path.join(base_dir, d)
        if not os.path.isdir(candidate):
            continue
        for root, _, files in os.walk(candidate):
            if source_file in files:
                return os.path.join(root, source_file)

    for root, _, files in os.walk(base_dir):
        if source_file in files:
            return os.path.join(root, source_file)

    return None


def reprocess_all(dry_run: bool = True, search_dirs=None):
    """
    Re-reads each document's ORIGINAL PDF from disk (located via
    source_file), re-runs PDF extraction, OCR cleanup, question
    extraction, and round classification, then updates ONLY
    rounds[].questions and rounds[].tips in MongoDB in-place.

    company, role, year, difficulty, outcome, source_file are
    left completely untouched. No new documents are created.

    Set dry_run=False to actually write changes to MongoDB.
    """
    from models.interview import InterviewExperience, Round

    search_dirs = search_dirs or DEFAULT_PDF_DIRS

    docs = InterviewExperience.objects()
    total = docs.count()
    print(f"Found {total} documents in MongoDB.")

    updated        = 0
    unchanged      = 0
    pdf_not_found  = 0
    extract_failed = 0
    parse_failed   = 0

    for doc in docs:
        source_file = getattr(doc, "source_file", None)
        if not source_file:
            print(f"--- SKIP (no source_file) — id={doc.id}")
            pdf_not_found += 1
            continue

        pdf_path = find_pdf_path(source_file, search_dirs)
        if not pdf_path:
            print(f"--- NOT FOUND on disk: {source_file}")
            pdf_not_found += 1
            continue

        try:
            extracted = extract_text(pdf_path)
            raw_text  = extracted["text"]
        except Exception as e:
            print(f"--- EXTRACTION FAILED: {source_file} — {e}")
            extract_failed += 1
            continue

        if len(raw_text.strip()) < 50:
            print(f"--- INSUFFICIENT TEXT: {source_file}")
            extract_failed += 1
            continue

        try:
            cleaned = clean_text(raw_text)
            cleaned = merge_wrapped_lines(cleaned)
            new_rounds_data = extract_rounds_with_questions(cleaned)
        except Exception as e:
            print(f"--- PARSE FAILED: {source_file} — {e}")
            parse_failed += 1
            continue

        old_questions = [q for r in doc.rounds for q in r.questions]
        new_questions = [q for r in new_rounds_data for q in r["questions"]]

        if old_questions == new_questions:
            unchanged += 1
            continue

        print(f"\n--- {source_file} ({doc.company}) ---")
        print(f"  OLD ({len(old_questions)}): {old_questions[:3]}")
        print(f"  NEW ({len(new_questions)}): {new_questions[:3]}")

        if not dry_run:
            doc.rounds = [
                Round(
                    round_type=r["round_type"],
                    questions=r["questions"],
                    tips=r.get("tips", []),
                )
                for r in new_rounds_data
            ]
            doc.save()

        updated += 1

    print(f"\n{'DRY RUN — ' if dry_run else ''}Summary:")
    print(f"  Total documents:        {total}")
    print(f"  Updated:                {updated}")
    print(f"  Unchanged:              {unchanged}")
    print(f"  PDF not found on disk:  {pdf_not_found}")
    print(f"  Extraction failed:      {extract_failed}")
    print(f"  Parse failed:           {parse_failed}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually write changes to MongoDB. Without this flag, runs as a dry run only.",
    )
    parser.add_argument(
        "--pdf-dir",
        action="append",
        dest="pdf_dirs",
        default=None,
        help="Directory to search for original PDFs (can be passed multiple times). "
             "Defaults to: " + ", ".join(DEFAULT_PDF_DIRS),
    )
    args = parser.parse_args()
    reprocess_all(dry_run=not args.apply, search_dirs=args.pdf_dirs)