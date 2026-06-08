# services/rule_parser.py
import re

COMPANY_KEYWORDS = ["google", "oracle", "morgan stanley", "amazon", "microsoft"]
ROUND_PATTERNS = [
    r"round\s*[1-9]", r"technical\s*round", r"hr\s*round",
    r"coding\s*round", r"system\s*design", r"managerial"
]

def extract_company(text: str) -> str:
    text_lower = text.lower()
    for company in COMPANY_KEYWORDS:
        if company in text_lower:
            return company.title()
    return "Unknown"

def extract_rounds(text: str) -> list:
    rounds = []
    for pattern in ROUND_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        rounds.extend(matches)
    return list(set(rounds))

def extract_questions(text: str) -> list:
    # Questions usually end with "?" or follow "asked me to"
    questions = re.findall(r'[A-Z][^.!?]*\?', text)
    # Also catch: "They asked me to implement X"
    task_patterns = re.findall(
        r'(?:asked|told)\s+(?:me\s+)?(?:to\s+)(.+?)(?:\.|$)',
        text, re.IGNORECASE
    )
    return questions + task_patterns


def parse_structure(text: str) -> dict:
    """Entry point called by pipeline.py"""
    return {
        "company":        extract_company(text),
        "role":           "Unknown",
        "year":           None,
        "difficulty":     "medium",
        "outcome":        "unknown",
        "rounds":         [
            {"round_type": r, "questions": [], "tips": []}
            for r in extract_rounds(text)
        ],
        "overall_tips":   [],
        "technologies":   [],
        "questions_flat": extract_questions(text)[:20]
    }