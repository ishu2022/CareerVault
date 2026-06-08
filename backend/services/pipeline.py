# services/pipeline.py
from services.pdf_extractor import extract_text
from services.rule_parser import parse_structure
import os

def run_pipeline(pdf_path: str, original_name: str = "", 
                 company_hint: str = None, year_hint: str = None) -> dict:
    
    print(f"[pipeline] Processing: {original_name or pdf_path}")

    # Step 1: PDF → text
    extracted = extract_text(pdf_path)
    raw_text  = extracted["text"]
    print(f"[pipeline] Extracted {len(raw_text)} chars via {extracted['method']}")

    # Step 2: Parse structure
    parsed = parse_structure(raw_text)

    # Step 3: Override with Drive metadata (much more reliable than regex)
    if company_hint and company_hint != "Unknown":
        parsed["company"] = company_hint
    if year_hint:
        parsed["year"] = year_hint

    print(f"[pipeline] Company: {parsed['company']} | Year: {parsed.get('year')} | Rounds: {len(parsed['rounds'])}")

    # Step 4: Save to MongoDB
    from models.interview import InterviewExperience, Round
    print("Round model:", Round)

    # Prevent duplicate processing
    existing = InterviewExperience.objects(source_file=original_name).first()
    if existing:
        print(f"[pipeline] Already exists in DB, skipping: {original_name}")
        return {"id": str(existing.id), "company": existing.company, 
                "skipped": True, "source_file": original_name}
    print("\n===== RAW PARSED ROUNDS =====")
    for r in parsed.get("rounds", []):
        print(r)

    rounds = [
    Round(
        round_type=r.get("round_type", "unknown"),
        questions=r.get("questions", []),
        tips=r.get("tips", [])
    )
    for r in parsed.get("rounds", [])
]

    doc = InterviewExperience(
        company           = parsed.get("company", "Unknown"),
        role              = parsed.get("role", "Unknown"),
        year              = parsed.get("year"),
        difficulty        = parsed.get("difficulty", "medium"),
        outcome           = parsed.get("outcome", "unknown"),
        rounds            = rounds,
        overall_tips      = parsed.get("overall_tips", []),
        technologies      = parsed.get("technologies", []),
        source_file       = original_name or os.path.basename(pdf_path),
        extraction_method = "rule_based",
        raw_text          = raw_text[:500]
    )
    print("Parsed rounds:")
    for r in rounds:
        print(r.round_type)

    doc.save()
    print(f"[pipeline] ✓ Saved → id: {doc.id}")

    return {
        "id":          str(doc.id),
        "company":     doc.company,
        "year":        doc.year,
        "rounds":      len(rounds),
        "source_file": doc.source_file,
        "skipped":     False
    }