# backend/services/pipeline.py
from services.pdf_extractor import extract_text
from services.rule_parser import parse_structure
# from services.ai_parser import ai_extract  # uncomment when ready

def run_pipeline(pdf_path: str, original_name: str = "") -> dict:
    # Step 1: Extract raw text from PDF
    extracted = extract_text(pdf_path)
    raw_text = extracted["text"]

    # Step 2: Rule-based parsing first (fast, free)
    parsed = parse_structure(raw_text)
    parsed["source_file"] = original_name
    parsed["extraction_method"] = "rule_based"
    parsed["raw_text"] = raw_text[:500]  # store preview only

    # Step 3: Save to MongoDB (uncomment once mongoengine is set up)
    # from models.interview import InterviewExperience
    # doc = InterviewExperience(**parsed)
    # doc.save()

    return parsed