# services/pipeline.py
import os
from services.pdf_extractor import extract_text
from services.rule_parser import parse_structure


def run_pipeline(
    pdf_path:      str,
    original_name: str  = "",
    company_hint:  str  = None,
    year_hint:     str  = None,
) -> dict:
    """
    Full pipeline: PDF file → MongoDB document.

    Returns a result dict:
      { id, company, year, rounds, source_file, skipped, error }

    Never raises — all exceptions are caught and returned in 'error'.
    """
    name = original_name or os.path.basename(pdf_path)

    # ── Duplicate guard ──────────────────────────────────────────
    try:
        from models.interview import InterviewExperience
        existing = InterviewExperience.objects(source_file=name).first()
        if existing:
            print(f"[pipeline] Duplicate, skipping: {name}")
            return {
                'id':          str(existing.id),
                'company':     existing.company,
                'year':        existing.year,
                'rounds':      len(existing.rounds),
                'source_file': name,
                'skipped':     True,
                'error':       None,
            }
    except Exception as e:
        print(f"[pipeline] Warning: DB duplicate check failed ({e}), continuing")

    # ── Step 1: PDF → raw text ───────────────────────────────────
    try:
        extracted = extract_text(pdf_path)
        raw_text  = extracted['text']
        method    = extracted['method']
        print(f"[pipeline] Extracted {len(raw_text)} chars via {method} — {name}")
    except Exception as e:
        print(f"[pipeline] Extraction failed: {name} — {e}")
        return {'source_file': name, 'skipped': False, 'error': f"extraction: {e}"}

    if len(raw_text.strip()) < 50:
        print(f"[pipeline] Too little text, skipping: {name}")
        return {'source_file': name, 'skipped': True, 'error': "insufficient text"}

    # ── Step 2: Text → structured dict ──────────────────────────
    try:
        parsed = parse_structure(raw_text)
    except Exception as e:
        print(f"[pipeline] Parse failed: {name} — {e}")
        return {'source_file': name, 'skipped': False, 'error': f"parsing: {e}"}

    # ── Step 3: Override with Drive metadata (authoritative) ─────
    if company_hint and company_hint.strip() and company_hint != 'Unknown':
        parsed['company'] = company_hint.strip()
    if year_hint:
        parsed['year'] = str(year_hint)

    print(f"[pipeline] Company: {parsed['company']} | Year: {parsed['year']} | Rounds: {len(parsed['rounds'])}")

    # ── Step 4: Save to MongoDB ──────────────────────────────────
    try:
        from models.interview import InterviewExperience, Round

        rounds = [
            Round(
                round_type = r.get('round_type', 'unknown'),
                questions  = r.get('questions',  []),
                tips       = r.get('tips',        []),
            )
            for r in parsed.get('rounds', [])
        ]

        doc = InterviewExperience(
            company           = parsed['company'],
            role              = parsed.get('role',        'Unknown'),
            year              = parsed.get('year'),
            difficulty        = parsed.get('difficulty',  'medium'),
            outcome           = parsed.get('outcome',     'unknown'),
            rounds            = rounds,
            overall_tips      = parsed.get('overall_tips',  []),
            technologies      = parsed.get('technologies',  []),
            source_file       = name,
            extraction_method = 'rule_based',
            raw_text          = raw_text[:500],
        )
        doc.save()
        print(f"[pipeline] ✓ Saved → id: {doc.id}")

        return {
            'id':          str(doc.id),
            'company':     doc.company,
            'year':        doc.year,
            'rounds':      len(rounds),
            'source_file': name,
            'skipped':     False,
            'error':       None,
        }

    except Exception as e:
        print(f"[pipeline] DB save failed: {name} — {e}")
        return {'source_file': name, 'skipped': False, 'error': f"db_save: {e}"}