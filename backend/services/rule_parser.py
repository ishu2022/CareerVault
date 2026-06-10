# services/rule_parser.py
import re

# ──────────────────────────────────────────────
# Company keywords
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
# Round patterns + normaliser
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


def _normalise_round_type(raw: str) -> str:
    low = raw.lower().strip()
    if low in ROUND_TYPE_MAP:
        return ROUND_TYPE_MAP[low]
    for key, val in ROUND_TYPE_MAP.items():
        if key in low:
            return val
    return 'unknown'


# ──────────────────────────────────────────────
# Question extraction
# ──────────────────────────────────────────────

def extract_questions(text: str) -> list:
    """
    Extract all questions from the full text.
    Returns a flat deduplicated list of strings.
    """
    found = []

    # Pattern 1: sentences ending with ?
    direct = re.findall(r'[A-Z][^.!?\n]{10,}[?]', text)
    found.extend(direct)

    # Pattern 2: "asked me to implement X"
    tasks = re.findall(
        r'(?:asked|told)\s+(?:me\s+)?(?:to\s+)([^.!\n]{10,})',
        text, re.IGNORECASE
    )
    found.extend(tasks)

    # Pattern 3: "Q: ..." or "Question: ..."
    labeled = re.findall(
        r'(?:Q\s*[:.)]\s*|Question\s*[:.)]\s*)([^\n]{10,})',
        text, re.IGNORECASE
    )
    found.extend(labeled)

    # Pattern 4: "implement/design/write/find/explain X"
    imperatives = re.findall(
        r'(?:implement|design|write|find|explain|describe|solve|given)\s+([^.!\n?]{15,})',
        text, re.IGNORECASE
    )
    found.extend(imperatives)

    # Deduplicate preserving order
    seen   = set()
    unique = []
    for q in found:
        q = q.strip()
        if q and len(q) > 10 and q not in seen:
            seen.add(q)
            unique.append(q)

    return unique[:50]  # cap at 50


# ──────────────────────────────────────────────
# Round extraction — WITH questions attached
# ──────────────────────────────────────────────

def extract_rounds_with_questions(text: str) -> list:
    """
    THE KEY FUNCTION.

    Finds every round mention in the text, then extracts
    the questions that appear in the text segment AFTER
    that round heading (up to the next round heading).

    Returns:
    [
        {
            'round_type': 'coding',
            'questions':  ['What is BST?', 'Implement LRU cache'],
            'tips':       []
        },
        ...
    ]
    """
    # ── Step 1: Find all round positions in text ─────────────────
    combined_pattern = '|'.join(f'(?:{p})' for p in ROUND_PATTERNS)
    round_matches = list(re.finditer(combined_pattern, text, re.IGNORECASE))

    if not round_matches:
        # No rounds detected — put all questions in one 'unknown' round
        all_questions = extract_questions(text)
        if all_questions:
            return [{'round_type': 'unknown', 'questions': all_questions, 'tips': []}]
        return []

    # ── Step 2: Slice text per round, extract questions per slice ─
    rounds   = []
    seen_types = set()

    for idx, match in enumerate(round_matches):
        round_type = _normalise_round_type(match.group(0))

        # Skip duplicate round types
        if round_type in seen_types:
            continue
        seen_types.add(round_type)

        # Text segment: from this round heading to the next
        start = match.end()
        end   = round_matches[idx + 1].start() if idx + 1 < len(round_matches) else len(text)
        segment = text[start:end]

        # Extract questions only from this segment
        segment_questions = extract_questions(segment)

        rounds.append({
            'round_type': round_type,
            'questions':  segment_questions,
            'tips':       []
        })

    return rounds


# ──────────────────────────────────────────────
# Remaining extractors
# ──────────────────────────────────────────────

def extract_company(text: str) -> str:
    text_lower = text.lower()
    for company in COMPANY_KEYWORDS:
        if company in text_lower:
            return ' '.join(w.capitalize() for w in company.split())
    return 'Unknown'


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
# Main entry point
# ──────────────────────────────────────────────

def parse_structure(text: str) -> dict:
    """
    Called by pipeline.py.
    company and year are overridden by Drive metadata in pipeline.py.
    """
    rounds = extract_rounds_with_questions(text)

    return {
        'company':      extract_company(text),
        'role':         'Unknown',
        'year':         None,
        'difficulty':   extract_difficulty(text),
        'outcome':      extract_outcome(text),
        'rounds':       rounds,
        'overall_tips': [],
        'technologies': [],
    }