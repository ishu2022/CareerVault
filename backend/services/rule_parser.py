# services/rule_parser.py
import re
from typing import List, Optional, Tuple

try:
    import wordninja
    _WORDNINJA_AVAILABLE = True
except ImportError:  # pragma: no cover
    _WORDNINJA_AVAILABLE = False


# ── Company keywords (body-scan fallback) ─────────────────────────

COMPANY_KEYWORDS = [
    "morgan stanley", "goldman sachs", "jp morgan chase", "jp morgan",
    "j.p. morgan", "jpmorgan chase", "jpmorgan", "jpmc",
    "deutsche bank", "wells fargo", "bank of america", "bofa", "baml",
    "bny mellon", "bny", "sap labs", "sap", "de shaw", "d.e. shaw",
    "texas instruments", "russell investments", "fractal analytics",
    "fractal", "credit suisse", "procter & gamble", "p&g",
    "citicorp", "citigroup", "citibank", "citi", "barclays",
    "hsbc", "ubs", "visa", "npci", "tracelink", "hdfc", "kotak",
    "msci", "mahindra", "fiserv", "pwc", "deloitte", "infosys",
    "ibm", "cisco", "tcs", "accenture", "wipro", "nomura",
    "nvidia", "siemens", "samsung", "hilti", "htsi", "oracle",
    "dolat capital", "dolat", "axxela research and analytics", "axxela",
    "mastercard",
    "microsoft", "amazon", "google",
]


# ══════════════════════════════════════════════════════════════════
# ROUND CLASSIFICATION — technical / hr / skip
# ══════════════════════════════════════════════════════════════════
#
# Order matters: more specific patterns are listed before broader ones
# so e.g. "Technical Interview1(Offline)" matches the technical pattern
# before any looser fallback could misfire.

ROUND_HEADER_RULES: List[Tuple[str, str]] = [
    # ── SKIP: Online Assessment / Coding / Aptitude / GD / misc screens ──
    (r"\bonline\s*assessment\b",                   "skip"),
    (r"\bonline\s*(?:test|round)\b",                "skip"),
    (r"\boa\s*round\b",                             "skip"),
    (r"\bcoding\s*(?:round|test|assessment|challenge)\b", "skip"),
    (r"\bapt?itude\s*(?:test|round)\b",             "skip"),
    (r"\bwritten\s*test\b",                         "skip"),
    (r"\bgroup\s*discussion\b",                     "skip"),
    (r"\bprofessional\s*fitness\b",                 "skip"),
    (r"\bpsychometric\b",                           "skip"),
    (r"\bshortlisting\b",                           "skip"),
    (r"\bresume\s*shortlist",                       "skip"),

    # ── TECHNICAL ───────────────────────────────────────────────────
    (r"\btechnical\s*(?:round|interview)\s*\d*\b",  "technical"),
    (r"\bmachine\s*coding\b",                       "technical"),
    (r"\bsystem\s*design\b",                        "technical"),
    (r"\bf2f\b",                                    "technical"),
    (r"\bface\s*to\s*face\b",                       "technical"),

    # ── HR ─────────────────────────────────────────────────────────
    (r"\bhr\s*(?:round|interview)\b",                "hr"),
    (r"\bhuman\s*resource",                          "hr"),
    (r"\bmanagerial\s*(?:round|interview)\b",        "hr"),
    (r"\bbehaviou?ral\s*(?:round|interview)\b",      "hr"),

    # ── Generic numbered "Round N" with no other signal: treat as
    #    technical by default (most numbered rounds in this corpus are
    #    technical discussions), but this is intentionally LAST so any
    #    more specific pattern above always wins first.
    (r"\bround\s*[1-9]\b",                          "technical"),
]

_COMBINED_HEADER_RE = re.compile(
    "|".join(f"(?:{p})" for p, _ in ROUND_HEADER_RULES),
    re.IGNORECASE,
)


def _classify_round_header(raw: str) -> str:
    """Returns 'technical', 'hr', or 'skip' for a matched header span."""
    low = raw.lower()
    for pattern, bucket in ROUND_HEADER_RULES:
        if re.search(pattern, low, re.IGNORECASE):
            return bucket
    return "technical"  # fallback: never silently invent a 4th bucket


# ── Text cleaning ─────────────────────────────────────────────────

def clean_text(raw: str) -> str:
    text = raw
    text = text.replace("\u2019", "'").replace("\u2018", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2013", "-").replace("\u2014", "-")
    text = text.replace("\u00a0", " ")
    text = re.sub(r'\(cid:\d+\)', '', text)
    text = re.sub(r'-\n(\w)', r'\1', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    lines = text.split('\n')
    cleaned = [
        l.strip() for l in lines
        if len(l.strip()) >= 3
        and not re.fullmatch(r'[\d\s\-\u2013|/\\]+', l.strip())
    ]
    return '\n'.join(cleaned)


def merge_wrapped_lines(text: str) -> str:
    """Merge lines that are clearly continuations of the previous line."""
    CONT = {
        "and", "or", "but", "so", "yet", "nor", "for", "which", "that",
        "where", "when", "while", "who", "with", "to", "of", "in", "on",
        "at", "by", "as",
    }
    lines = text.split('\n')
    merged = []
    i = 0
    while i < len(lines):
        current = lines[i].strip()
        if not current:
            merged.append('')
            i += 1
            continue
        while i + 1 < len(lines):
            nxt = lines[i + 1].strip()
            if not nxt:
                break
            first_word = nxt.split()[0].lower().rstrip('.,;:') if nxt.split() else ''
            is_cont = nxt[0].islower() or first_word in CONT
            ends_sent = current.endswith(('.', '?', '!', ':'))
            if is_cont and not ends_sent:
                current = current + ' ' + nxt
                i += 1
            else:
                break
        merged.append(current)
        i += 1
    return '\n'.join(merged)


# ── OCR / merged-word repair ───────────────────────────────────────

_DOMAIN_TERMS = [
    "chatgpt", "leetcode", "github", "gitlab", "javascript", "typescript",
    "postgresql", "mongodb", "kubernetes", "docker", "tensorflow",
    "pytorch", "fastapi", "django", "flask", "redis", "graphql",
    "oops", "dsa", "sql", "api", "json", "html", "css", "aws", "gcp",
]
_DOMAIN_TERMS_SORTED = sorted(_DOMAIN_TERMS, key=len, reverse=True)

_CAMELCASE_BRANDS = [
    "JavaScript", "TypeScript", "PostgreSQL", "MongoDB", "GitHub",
    "GitLab", "LeetCode", "ChatGPT", "GraphQL", "FastAPI", "PyTorch",
    "TensorFlow",
]

_MERGED_MIN_LETTERS = 7


def _looks_merged(token: str) -> bool:
    letters = re.sub(r'[^A-Za-z]', '', token)
    if len(letters) < _MERGED_MIN_LETTERS:
        return False
    return letters.isalpha()


def _segment_word(word: str) -> List[str]:
    low = word.lower()
    for term in _DOMAIN_TERMS_SORTED:
        idx = low.find(term)
        if idx != -1:
            before = word[:idx]
            match = word[idx:idx + len(term)]
            after = word[idx + len(term):]
            parts: List[str] = []
            if before:
                parts.extend(_segment_word(before) if len(before) >= 10 else [before])
            parts.append(match)
            if after:
                parts.extend(_segment_word(after) if len(after) >= 10 else [after])
            return parts

    if _WORDNINJA_AVAILABLE:
        segmented = wordninja.split(word)
        if segmented:
            return segmented
    return [word]


def _fix_ocr(text: str) -> str:
    """
    Normalises OCR/extraction spacing issues, e.g.:
      "Whatisrecursion?" -> "What is recursion?"
      "Howchatgptworks?" -> "How chatgpt works?"
    Protects known camelCase brand names (JavaScript, MongoDB, ...) so
    they are never split.
    """
    protected: dict = {}
    for i, brand in enumerate(_CAMELCASE_BRANDS):
        pattern = rf'\b{re.escape(brand)}\b'
        if re.search(pattern, text, re.IGNORECASE):
            placeholder = f"\uE000{i}\uE001"
            text = re.sub(pattern, placeholder, text, flags=re.IGNORECASE)
            protected[placeholder] = brand

    def _process_word_run(core: str) -> str:
        if not _looks_merged(core):
            return core
        had_leading_cap = core[0].isupper()
        pieces = _segment_word(core)
        if len(pieces) <= 1:
            return core
        rebuilt = []
        for i, p in enumerate(pieces):
            if i == 0 and had_leading_cap:
                rebuilt.append(p[:1].upper() + p[1:].lower() if p.isalpha() else p)
            elif p.lower() in _DOMAIN_TERMS:
                rebuilt.append(p.lower())
            else:
                rebuilt.append(p)
        return ' '.join(rebuilt)

    out_tokens: List[str] = []
    for token in text.split(' '):
        if not token:
            out_tokens.append(token)
            continue
        rebuilt_token = re.sub(
            r'[A-Za-z]+',
            lambda m: _process_word_run(m.group(0)),
            token,
        )
        out_tokens.append(rebuilt_token)

    result = ' '.join(out_tokens)
    for placeholder, brand in protected.items():
        result = result.replace(placeholder, brand)
    return result


# ══════════════════════════════════════════════════════════════════
# CONTENT-LEVEL REJECTION RULES (Layer 2)
# ══════════════════════════════════════════════════════════════════

# Advice / instructional tips — never questions.
ADVICE_PATTERNS = [
    r"^don'?t\s+", r"^never\s+", r"^always\s+", r"^make\s+sure\s+",
    r"^try\s+to\s+", r"^avoid\s+",
    r"^be\s+(confident|calm|honest|prepared|polite|respectful|genuine|"
    r"yourself|clear|consistent)\b",
    r"^remember\s+(to|that)\b", r"^please\s+", r"^you\s+should\s+",
    r"^one\s+should\s+",
    r"^keep\s+(calm|practicing|trying|revising|in\s+mind)\b",
    r"^focus\s+on\s+", r"^revise\s+", r"^practice\s+",
    r"^stay\s+(calm|confident|honest)\b", r"^maintain\s+",
    r"^prepare\s+(well|thoroughly|in\s+advance)\b",
    r"\bI\s+would\s+suggest\b",
    r"^my\s+(advice|tip|suggestion)\s+(is|would\s+be)\b",
]
_ADVICE_RE = re.compile("|".join(f"(?:{p})" for p in ADVICE_PATTERNS), re.IGNORECASE)


def _is_advice(text: str) -> bool:
    return bool(_ADVICE_RE.search(text.strip()))


# Round/section HEADINGS — must never be extracted as questions, even
# though some (e.g. "Technical Interview1(Offline)") could otherwise
# slip past a naive opener check.
_HEADING_RE = re.compile(
    r"^(round\s*\d+\s*[:.\-]?\s*$|"
    r"technical\s*(?:round|interview)\s*\d*\s*(?:\(.*\))?\s*$|"
    r"professional\s+fitness\s+round\s*$|"
    r"online\s+assessment\s*$|coding\s+round\s*$|"
    r"hr\s+round\s*$|managerial\s+round\s*$|"
    r"group\s+discussion\s*$|apt?itude\s*(?:test|round)\s*$|"
    r"written\s+test\s*$|interview\s+experience\s*$|"
    r"my\s+interview\s+experience\s*$|placement\s+experience\s*$)",
    re.IGNORECASE,
)


def _is_heading(text: str) -> bool:
    return bool(_HEADING_RE.match(text.strip()))


# Bare noun-phrase TITLES (1-3 capitalised words, no verb at all) —
# these are coding-challenge / OA problem TITLES, not questions, e.g.
# "Power Limit", "Auto Suggest", "Backlinks Sorting".
_BARE_TITLE_RE = re.compile(r'^[A-Z][a-zA-Z\']*(\s+[A-Z][a-zA-Z\']*){0,2}[.?!]?$')

# Common verbs that, if present, mean a short capitalised phrase is NOT
# a bare title (it's an imperative/question even if short), so the
# bare-title rejection should not fire on these.
_HAS_VERB_RE = re.compile(
    r'\b(is|are|was|were|do|does|did|can|could|should|would|will|have|'
    r'has|had|explain|describe|define|tell|compare|differentiate|'
    r'implement|design|write|list|name|mention|give|discuss|walk|share|'
    r'rate|justify|convince)\b',
    re.IGNORECASE,
)


def _is_bare_title(text: str) -> bool:
    s = text.strip()
    if len(s.split()) > 3:
        return False
    if _HAS_VERB_RE.search(s):
        return False
    return bool(_BARE_TITLE_RE.match(s))


# Coding / OA PROBLEM STATEMENTS — narrative algorithmic prompts that
# describe inputs/outputs rather than ask a conceptual question. These
# are rejected by content even if they leak past the section skip
# (e.g. no round header was detected at all in a short PDF).
_CODING_PROBLEM_RE = re.compile(
    r'\b(you\s+are\s+given|given\s+an?\s+array|given\s+a\s+string|'
    r'given\s+two\s+(?:arrays|strings|numbers)|given\s+a\s+linked\s+list|'
    r'return\s+the\s+(?:maximum|minimum|number|count|index)|'
    r'find\s+the\s+(?:maximum|minimum|number\s+of|count\s+of|kth)\b.*\b(?:array|string|list)|'
    r'write\s+a\s+function\s+(?:that|to)|implement\s+a\s+function\s+(?:that|to)|'
    r'a\s+query\s+string\s+and\s+an\s+array)\b',
    re.IGNORECASE,
)


def _is_coding_problem_statement(text: str) -> bool:
    return bool(_CODING_PROBLEM_RE.search(text.strip()))


# Company FACT / TRIVIA statements — e.g. "1/3rd of world's total money
# goes through BNY daily". These describe the company, not a question.
_FACT_STATEMENT_RE = re.compile(
    r"^\d+/\d+(?:st|nd|rd|th)?\s+of\b|"
    r"\bgoes\s+through\b|\bworth\s+\$|\bmillion\s+(?:users|customers|"
    r"transactions)\b|\b(?:founded|headquartered|established)\s+in\b|"
    r"^[A-Z][a-z]+\s+(?:is|was)\s+(?:one\s+of|the\s+world'?s|a\s+global)\b",
    re.IGNORECASE,
)


def _is_fact_statement(text: str) -> bool:
    return bool(_FACT_STATEMENT_RE.search(text.strip()))


# Generic metadata / narration noise (kept from v3, still useful).
METADATA_PATTERNS = [
    r'\d+\s+questions?\s+(in\s+total|were\s+asked|asked)',
    r'(coding|interview)\s+question[s]?\s+was\s+as\s+follows',
    r'following\s+questions?\s+were\s+asked',
    r'asked\s+the\s+following',
    r'questions?\s+asked\s+in',
    r'^(round|phase|section)\s*\d',
    r'(my\s+)?answer\s*[:\-]',
    r'i\s+(said|replied|answered|told|mentioned)',
    r'^(total|overall)\s*:?\s*\d',
]

NOISE_RE = [
    r'^page\s+\d+',
    r'^\d+\s*$',
    r'^(www\.|http)',
    r'^\s*[\-\u2013\u2022*]\s*$',
]

MAX_LEN = 300


# ══════════════════════════════════════════════════════════════════
# QUESTION-SHAPE DETECTION — the positive signal
# ══════════════════════════════════════════════════════════════════
#
# A candidate is ONLY treated as a real Technical/HR question if it
# positively matches one of these openers (after stripping a leading
# "Q3:" / "2)" style label). There is no length-based admission path
# any more: shape, not size, decides validity. This directly fixes the
# previous failure mode where short non-questions slipped past length
# floors and long narrative sentences slipped past on word count alone.

_LABEL_PREFIX_RE = re.compile(
    r'^(?:Q(?:uestion)?\.?\s*\d*\s*[:\.\-\)]\s*|\d+\s*[\.\)]\s*)',
    re.IGNORECASE,
)

QUESTION_OPENER_RE = re.compile(
    r'^(What|Why|How|When|Where|Which|Who|Whom|Whose|Can|Could|Should|'
    r'Would|Will|Do|Does|Did|Is|Are|Was|Were|Have|Has|Had|'
    r'Explain|Describe|Define|Tell|Compare|Differentiate|Difference|'
    r'Discuss|Elaborate|Implement|Design|Write|List|Name|Mention|Give|'
    r'Walk|Share|Rate|Justify|Convince|Suppose|Imagine)\b',
    re.IGNORECASE,
)


def _looks_like_question(text: str) -> bool:
    """
    Positive shape check: True only if the (label-stripped) text starts
    with a recognised question word, auxiliary-verb opener, or
    technical/behavioural prompt verb.
    """
    s = _LABEL_PREFIX_RE.sub('', text.strip()).strip()
    if not s:
        return False
    return bool(QUESTION_OPENER_RE.match(s))


def _is_valid_question(text: str) -> bool:
    """
    Final gate combining all Layer-2 content checks. A string only
    becomes a stored question if it:
      - is not advice/a tip
      - is not a round/section heading
      - is not a bare noun-phrase title
      - is not a coding/OA problem statement
      - is not a company fact/trivia statement
      - is not generic metadata/narration noise
      - DOES start with a recognised question/prompt opener
      - is within a sane length range
    """
    s = text.strip()
    if not s:
        return False
    if len(s) > MAX_LEN:
        return False

    if _is_advice(s):
        return False
    if _is_heading(s):
        return False
    if _is_bare_title(s):
        return False
    if _is_coding_problem_statement(s):
        return False
    if _is_fact_statement(s):
        return False
    if any(re.match(p, s, re.IGNORECASE) for p in NOISE_RE):
        return False
    if any(re.search(p, s.lower()) for p in METADATA_PATTERNS):
        return False

    if not _looks_like_question(s):
        return False

    if len(s.split()) < 2:
        return False

    return True


def _deduplicate(qs: List[str]) -> List[str]:
    seen: List[str] = []
    seen_lc: List[str] = []
    for q in qs:
        ql = q.lower().strip()
        if ql in seen_lc:
            continue
        dominated = False
        for i, ex in enumerate(seen_lc):
            if ex in ql:
                seen[i] = q
                seen_lc[i] = ql
                dominated = True
                break
            if ql in ex:
                dominated = True
                break
        if not dominated:
            seen.append(q)
            seen_lc.append(ql)
    return seen


# ══════════════════════════════════════════════════════════════════
# CANDIDATE EXTRACTION
# ══════════════════════════════════════════════════════════════════

def _candidates(text: str) -> List[str]:
    """
    Extracts raw question-shaped candidates from a TEXT SEGMENT THAT HAS
    ALREADY BEEN CONFIRMED TO BE A TECHNICAL/HR SECTION by the caller
    (extract_rounds_with_questions). This function does not know about
    round types — section-level filtering happens one level up so that
    OA/Coding content is never even handed to this function in the
    normal (round-headers-detected) path.
    """
    found = []
    for line in text.split('\n'):
        line = _fix_ocr(line.strip())
        if not line:
            continue

        if line.endswith('?'):
            found.append(line)
            continue

        m = re.match(r'^(?:Q\.?\s*)?\d+[\.\)]\s*(.+)', line)
        if m:
            found.append(m.group(1).strip())
            continue

        if QUESTION_OPENER_RE.match(line):
            found.append(line)
            continue

        m2 = re.search(
            r'(?:asked|told)\s+(?:me\s+)?(?:to\s+)'
            r'((?:Explain|Describe|Define|Implement|Design|Write|Compare|'
            r'Differentiate|Discuss|Elaborate\s+on)[^.!,\n]{10,})',
            line, re.IGNORECASE
        )
        if m2:
            found.append(m2.group(1).strip())

    return found


def extract_questions(text: str) -> List[str]:
    """
    Public API — returns clean, deduplicated TECHNICAL/HR questions from
    a text segment. Callers are expected to have already excluded
    Online Assessment / Coding Round content; this function additionally
    re-applies the full content-level validator as a safety net for
    text with no detected round headers at all.
    """
    raw = _candidates(text)
    valid = [c for c in raw if _is_valid_question(c)]
    unique = _deduplicate(valid)
    return unique[:40]


# ══════════════════════════════════════════════════════════════════
# ROUND BOUNDARY DETECTION (Layer 1 — the section skip)
# ══════════════════════════════════════════════════════════════════

def _find_round_boundaries(text: str) -> List[Tuple[int, int, str]]:
    """
    Finds every round-header occurrence and returns
    (start, end, bucket) spans, where bucket is 'technical', 'hr', or
    'skip'. Name kept exactly as required for compatibility.
    """
    matches = list(_COMBINED_HEADER_RE.finditer(text))
    if not matches:
        return []
    out = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        bucket = _classify_round_header(m.group(0))
        out.append((start, end, bucket))
    return out


def extract_rounds_with_questions(text: str) -> List[dict]:
    """
    Slices text by round boundary, SKIPS any 'skip'-bucket section
    (Online Assessment, Coding Round, Aptitude, Written Test, Group
    Discussion, Professional Fitness, etc) entirely — those sections
    are never passed to extract_questions() — and only extracts
    questions from 'technical' and 'hr' sections.

    If no round headers are detected at all (short/informal PDFs),
    falls back to scanning the whole text once, relying entirely on
    Layer 2 content validation (_is_valid_question) to keep only real
    Technical/HR-style questions and reject OA/coding/fact/heading
    content that might otherwise be present with no section markers.

    Name and return shape kept exactly as required for compatibility:
        [{'round_type': str, 'questions': [...], 'tips': []}]
    """
    boundaries = _find_round_boundaries(text)

    if not boundaries:
        qs = extract_questions(text)
        return [{'round_type': 'unknown', 'questions': qs, 'tips': []}] if qs else []

    rounds = []
    seen_types = set()
    for (start, end, bucket) in boundaries:
        if bucket == "skip":
            # Layer 1: Online Assessment / Coding / Aptitude / GD / etc.
            # is dropped here, before any question extraction runs.
            continue
        if bucket in seen_types:
            continue
        seen_types.add(bucket)
        rounds.append({
            'round_type': bucket,
            'questions': extract_questions(text[start:end]),
            'tips': [],
        })
    return rounds


# ══════════════════════════════════════════════════════════════════
# COMPANY EXTRACTION (unchanged behaviour from v3, schema-compatible)
# ══════════════════════════════════════════════════════════════════

_FILENAME_NOISE_WORDS = {
    "experience", "experiences", "interview", "interviews",
    "internship", "internships", "exp", "ie", "fte", "intern",
    "process", "interviewexperience", "round", "rounds",
    "final", "v1", "v2", "copy", "draft", "new", "updated",
}


def _known_company_aliases() -> dict:
    try:
        from services.company_normalizer import COMPANY_NAME_MAP
        return COMPANY_NAME_MAP
    except ImportError:  # pragma: no cover
        return {}


def _strip_filename_noise(stem: str) -> str:
    stem = re.sub(r'\.pdf$', '', stem, flags=re.IGNORECASE)
    stem = re.sub(r'\(\d+\)\s*$', '', stem).strip()
    return stem


def extract_company_from_filename(filename: str) -> str:
    """
    Parses common real-world filename patterns to recover the company
    name BEFORE ever looking at the PDF body text.
    """
    if not filename:
        return ""

    stem = _strip_filename_noise(filename)
    if not stem:
        return ""

    aliases = _known_company_aliases()

    normalised = re.sub(r'[-_]+', ' ', stem)
    normalised = re.sub(r'\s{2,}', ' ', normalised).strip()
    search_low = normalised.lower()

    for key in sorted(aliases.keys(), key=len, reverse=True):
        if re.search(rf'\b{re.escape(key)}\b', search_low):
            m = re.search(rf'\b{re.escape(key)}\b', normalised, re.IGNORECASE)
            return m.group(0) if m else key

    for kw in sorted(COMPANY_KEYWORDS, key=len, reverse=True):
        if re.search(rf'\b{re.escape(kw)}\b', search_low):
            m = re.search(rf'\b{re.escape(kw)}\b', normalised, re.IGNORECASE)
            return m.group(0) if m else kw

    segmented = _fix_ocr(normalised)
    if segmented != normalised:
        segmented_low = segmented.lower()
        for key in sorted(aliases.keys(), key=len, reverse=True):
            if re.search(rf'\b{re.escape(key)}\b', segmented_low):
                m = re.search(rf'\b{re.escape(key)}\b', segmented, re.IGNORECASE)
                return m.group(0) if m else key
        for kw in sorted(COMPANY_KEYWORDS, key=len, reverse=True):
            if re.search(rf'\b{re.escape(kw)}\b', segmented_low):
                m = re.search(rf'\b{re.escape(kw)}\b', segmented, re.IGNORECASE)
                return m.group(0) if m else kw

    return ""


_EXPLICIT_COMPANY_LABEL_RE = re.compile(
    r'^\s*company\s*[:\-]\s*(.+?)\s*$',
    re.MULTILINE | re.IGNORECASE,
)


def _company_from_explicit_label(text: str) -> str:
    m = _EXPLICIT_COMPANY_LABEL_RE.search(text)
    if not m:
        return ""
    value = m.group(1).strip()
    if not value or len(value) > 60:
        return ""
    return value


def _company_from_body(text: str) -> str:
    low = text.lower()
    best_kw: Optional[str] = None
    best_idx = len(low) + 1
    for kw in COMPANY_KEYWORDS:
        idx = low.find(kw)
        if idx != -1 and idx < best_idx:
            best_idx = idx
            best_kw = kw
    if best_kw:
        return ' '.join(w.capitalize() for w in best_kw.split())
    return 'Unknown'


def extract_company(text: str, filename: str = "") -> str:
    if filename:
        from_name = extract_company_from_filename(filename)
        if from_name:
            return from_name
    from_label = _company_from_explicit_label(text)
    if from_label:
        return from_label
    return _company_from_body(text)


def extract_difficulty(text: str) -> str:
    low = text.lower()
    if any(w in low for w in ['very difficult', 'extremely hard', 'very tough', 'challenging']):
        return 'hard'
    if any(w in low for w in ['moderate', 'medium difficulty', 'average difficulty']):
        return 'medium'
    if any(w in low for w in ['easy', 'straightforward', 'simple', 'not difficult']):
        return 'easy'
    return 'medium'


def extract_outcome(text: str) -> str:
    low = text.lower()
    if any(w in low for w in ['selected', 'got the offer', 'offer letter', 'placed', 'cleared all', 'got ppo']):
        return 'selected'
    if any(w in low for w in ['rejected', 'not selected', 'did not get', 'unfortunately', 'could not clear']):
        return 'rejected'
    return 'unknown'


def extract_role(text: str) -> str:
    m = re.search(
        r'(?:applied\s+for|role\s*[:\-]|position\s*[:\-]|profile\s*[:\-])\s*'
        r'([A-Za-z][A-Za-z\s/]+?)(?:\n|,|\.|$)',
        text, re.IGNORECASE
    )
    if m:
        role = m.group(1).strip()
        if 5 < len(role) < 60:
            return role.title()
    m2 = re.search(
        r'\b(SDE|SWE|Software\s+(?:Developer|Engineer)|Data\s+(?:Analyst|Engineer|Scientist)|'
        r'Full\s+Stack|Backend\s+Developer|Frontend\s+Developer|ML\s+Engineer)\b',
        text, re.IGNORECASE
    )
    if m2:
        return m2.group(0).strip().title()
    return 'Unknown'


# ── Main entry point ──────────────────────────────────────────────

def parse_structure(text: str, filename: str = "") -> dict:
    """
    Called by pipeline.py. Schema-compatible with the existing
    MongoDB document shape — only the CONTENT of rounds[].questions
    changes (Technical/HR only), not the structure.
    """
    cleaned = clean_text(text)
    cleaned = merge_wrapped_lines(cleaned)
    return {
        'company': extract_company(cleaned, filename=filename),
        'role': extract_role(cleaned),
        'year': None,
        'difficulty': extract_difficulty(cleaned),
        'outcome': extract_outcome(cleaned),
        'rounds': extract_rounds_with_questions(cleaned),
        'overall_tips': [],
        'technologies': [],
    }