# services/rule_parser.py
import re

# ──────────────────────────────────────────────
# Company keywords (fallback when Drive path gives nothing)
# ──────────────────────────────────────────────

COMPANY_KEYWORDS = [
    "google", "oracle", "morgan stanley", "amazon", "microsoft",
    "goldman sachs", "jpmc", "jp morgan", "barclays", "deutsche bank",
    "wells fargo", "citi", "citicorp", "bny mellon", "bny", "sap labs", "sap",
    "samsung", "hilti", "htsi", "de shaw", "d.e. shaw", "ubs", "visa",
    "texas instruments", "bank of america", "bofa", "npci", "tracelink",
    "proctor & gamble", "p&g", "fractal", "hdfc", "kotak", "msci",
    "russell investments", "mahindra", "hsbc", "fiserv", "pwc", "deloitte",
    "infosys", "ibm", "cisco", "tcs", "accenture", "wipro",
    "nomura", "nvidia", "credit suisse", "siemens", "astra"
]

# ──────────────────────────────────────────────
# Round detection patterns
# ──────────────────────────────────────────────

ROUND_PATTERNS = [
    r'round\s*[1-9]',
    r'technical\s*round',
    r'coding\s*round',
    r'online\s*(?:test|round)',
    r'system\s*design',
    r'hr\s*round',
    r'managerial\s*round',
    r'aptitude\s*(?:test|round)',
    r'machine\s*coding',
    r'written\s*test',
]

# Maps raw regex match → clean round_type value
ROUND_TYPE_MAP = {
    'coding':           'coding',
    'coding round':     'coding',
    'online test':      'coding',
    'online round':     'coding',
    'aptitude':         'coding',
    'aptitude test':    'coding',
    'aptitude round':   'coding',
    'written test':     'coding',
    'technical':        'technical',
    'technical round':  'technical',
    'tech round':       'technical',
    'machine coding':   'technical',
    'system design':    'system_design',
    'design round':     'system_design',
    'lld':              'system_design',
    'hld':              'system_design',
    'hr':               'hr',
    'hr round':         'hr',
    'human resource':   'hr',
    'managerial':       'managerial',
    'managerial round': 'managerial',
    'manager round':    'managerial',
}


# ──────────────────────────────────────────────
# Internal helpers
# ──────────────────────────────────────────────

def _normalise_round_type(raw: str) -> str:
    """Map any raw regex match to a clean round_type string."""
    low = raw.lower().strip()
    # Direct match
    if low in ROUND_TYPE_MAP:
        return ROUND_TYPE_MAP[low]
    # Partial / substring match
    for key, val in ROUND_TYPE_MAP.items():
        if key in low:
            return val
    return 'unknown'


# ──────────────────────────────────────────────
# Extractors
# ──────────────────────────────────────────────

def extract_company(text: str) -> str:
    """Fallback company detection from text content."""
    text_lower = text.lower()
    for company in COMPANY_KEYWORDS:
        if company in text_lower:
            return ' '.join(w.capitalize() for w in company.split())
    return 'Unknown'


def extract_rounds(text: str) -> list:
    """
    Returns a list of clean round dicts:
    [{'round_type': 'coding', 'questions': [], 'tips': []}]
    Every round_type is normalised — no raw regex strings.
    """
    seen  = set()
    found = []
    for pattern in ROUND_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            norm_type = _normalise_round_type(match.group(0))
            if norm_type not in seen:
                seen.add(norm_type)
                found.append({
                    'round_type': norm_type,
                    'questions':  [],
                    'tips':       []
                })
    return found


def extract_questions(text: str) -> list:
    """Extract question strings from interview text."""
    # Direct questions ending with ?
    questions = re.findall(r'[A-Z][^.!?\n]{10,}[?]', text)
    # "asked me to X" patterns
    tasks = re.findall(
        r'(?:asked|told)\s+(?:me\s+)?(?:to\s+)([^.!\n]{10,})',
        text, re.IGNORECASE
    )
    combined = questions + tasks
    seen   = set()
    unique = []
    for q in combined:
        q = q.strip()
        if q and q not in seen:
            seen.add(q)
            unique.append(q)
    return unique[:30]


def extract_difficulty(text: str) -> str:
    low = text.lower()
    if any(w in low for w in ['very difficult', 'extremely hard', 'tough']):
        return 'hard'
    if any(w in low for w in ['moderate', 'medium', 'average']):
        return 'medium'
    if any(w in low for w in ['easy', 'straightforward', 'simple']):
        return 'easy'
    return 'medium'


def extract_outcome(text: str) -> str:
    low = text.lower()
    if any(w in low for w in ['selected', 'got the offer', 'offer letter', 'placed', 'cleared all']):
        return 'selected'
    if any(w in low for w in ['rejected', 'not selected', 'did not get', 'unfortunately']):
        return 'rejected'
    return 'unknown'


# ──────────────────────────────────────────────
# Main entry point — called by pipeline.py
# ──────────────────────────────────────────────

def parse_structure(text: str) -> dict:
    """
    Returns a clean dict ready for InterviewExperience model.
    company and year are overridden by Drive metadata in pipeline.py.
    """
    return {
        'company':        extract_company(text),
        'role':           'Unknown',
        'year':           None,
        'difficulty':     extract_difficulty(text),
        'outcome':        extract_outcome(text),
        'rounds':         extract_rounds(text),
        'overall_tips':   [],
        'technologies':   [],
        'questions_flat': extract_questions(text),
    }