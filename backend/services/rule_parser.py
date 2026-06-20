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

ROUND_HEADER_RULES: List[Tuple[str, str]] = [
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

    (r"\btechnical\s*(?:round|interview)\s*\d*\b",  "technical"),
    (r"\bmachine\s*coding\b",                       "technical"),
    (r"\bsystem\s*design\b",                        "technical"),
    (r"\bf2f\b",                                    "technical"),
    (r"\bface\s*to\s*face\b",                       "technical"),

    (r"\bhr\s*(?:round|interview)\b",                "hr"),
    (r"\bhuman\s*resource",                          "hr"),
    (r"\bmanagerial\s*(?:round|interview)\b",        "hr"),
    (r"\bbehaviou?ral\s*(?:round|interview)\b",      "hr"),

    (r"\bround\s*[1-9]\b",                          "technical"),
]

_COMBINED_HEADER_RE = re.compile(
    "|".join(f"(?:{p})" for p, _ in ROUND_HEADER_RULES),
    re.IGNORECASE,
)


def _classify_round_header(raw: str) -> str:
    low = raw.lower()
    for pattern, bucket in ROUND_HEADER_RULES:
        if re.search(pattern, low, re.IGNORECASE):
            return bucket
    return "technical"


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
    "enqueue", "dequeue", "traversal", "traversals", "discussion",
    "implementation", "abstraction", "encapsulation", "polymorphism",
    "inheritance", "recursion", "dbms",
    "algorithm", "algorithms", "reusability", "learnings", "given",
    "normalization", "denormalization", "deadlock", "multithreading",
    "synchronous", "asynchronous", "overloading", "overriding",
    "constructor", "destructor", "interface", "interfaces",
    "compilation", "optimization", "scalability", "concurrency",
    "virtualization", "serialization", "deserialization",
    "instantiate", "instantiation", "iterator", "iterators",
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

# ── PATCH 1: add a no-dependency fallback splitter, used when wordninja
# is unavailable OR returns the word unsplit. Inserted directly above
# _segment_word(), used inside it as a last-resort step.

_KNOWN_SPLIT_HEADS = (
    "what", "why", "how", "when", "where", "which", "who", "is", "are",
    "do", "does", "did", "can", "could", "should", "would", "will",
    "explain", "describe", "define", "tell", "compare", "implement",
    "design", "write", "discuss", "list", "name", "mention", "give",
)


def _regex_fallback_split(word: str) -> List[str]:
    """
    Dependency-free segmenter for the single most common OCR pattern in
    this corpus: a question opener glued directly onto the rest of the
    sentence with no internal capital ("Whatisinheritance",
    "Whatdoyouunderstandfrom..."). Tries each known head word as a
    prefix; if found, returns [head, remainder] so the remainder can be
    recursed into further if it is itself long/merged. This does not
    replace wordninja — it only fires when wordninja is missing or
    returned a single unsplit token.
    """
    low = word.lower()
    for head in sorted(_KNOWN_SPLIT_HEADS, key=len, reverse=True):
        if low.startswith(head) and len(word) > len(head) + 2:
            rest = word[len(head):]
            return [word[:len(head)], rest]
    return [word]

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
        if segmented and len(segmented) > 1:
            return segmented

    # PATCH: wordninja missing/unsplit — try the regex fallback before
    # giving up and returning the word whole.
    fallback = _regex_fallback_split(word)
    if len(fallback) > 1:
        return fallback
    return [word]

def _fix_ocr(text: str) -> str:
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


_BARE_TITLE_RE = re.compile(r'^[A-Z][a-zA-Z\']*(\s+[A-Z][a-zA-Z\']*){0,2}[.?!]?$')

_HAS_VERB_RE = re.compile(
    r'\b(is|are|was|were|do|does|did|can|could|should|would|will|have|'
    r'has|had|explain|describe|define|tell|compare|differentiate|'
    r'implement|design|write|list|name|mention|give|discuss|walk|share|'
    r'rate|justify|convince)\b',
    re.IGNORECASE,
)

_SECTION_TITLE_WORDS = re.compile(
    r'^(Round|Technical|HR|Online|Offline|Assessment|Interview|'
    r'Discussion|Test|Coding|Professional|Fitness|Aptitude|Written|'
    r'Group|Managerial|Behaviou?ral|Machine|System|Design|Shortlist(?:ing)?)$',
    re.IGNORECASE,
)


def _is_bare_title(text: str) -> bool:
    """
    Rejects bare noun-phrase TITLES (coding-challenge / OA problem /
    section-header names like "Power Limit", "Auto Suggest",
    "Technical Interview1(Offline)") that are not questions.

    A short capitalised phrase built ENTIRELY from the closed
    round/section vocabulary (Round, Technical, Offline, Fitness, ...)
    is always treated as a title, even at 3-4 words, since real
    section headers in this corpus are reliably built only from that
    vocabulary and contain no verb.
    """
    s = text.strip()

    if _HAS_VERB_RE.search(s):
        return False

    tokens = re.findall(r"[A-Za-z]+", s)
    if tokens and all(_SECTION_TITLE_WORDS.match(t) for t in tokens):
        return True

    if len(s.split()) > 3:
        return False

    return bool(_BARE_TITLE_RE.match(s))


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


_FACT_STATEMENT_RE = re.compile(
    r"^\d+/\d+(?:st|nd|rd|th)?\s+of\b|"
    r"\bgoes\s+through\b|\bworth\s+\$|\bmillion\s+(?:users|customers|"
    r"transactions)\b|\b(?:founded|headquartered|established)\s+in\b|"
    r"^[A-Z][a-z]+\s+(?:is|was)\s+(?:one\s+of|the\s+world'?s|a\s+global)\b",
    re.IGNORECASE,
)


def _is_fact_statement(text: str) -> bool:
    return bool(_FACT_STATEMENT_RE.search(text.strip()))


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

# Narrative patterns that describe a question being asked, rather than
# being phrased as one. Each captures ONLY the topic text already
# present in the source — nothing is invented. The matched topic is
# wrapped in the minimal question/imperative shape requested:
#   "I was asked about recursion"   -> "Explain recursion."
#   "asked me why Deutsche Bank"    -> "Why Deutsche Bank?"
#   "next question was inheritance" -> "Explain inheritance."
_NARRATIVE_PATTERNS = [
    # "asked/told me to <task verb> <topic>" — imperative, keep given verb
    (re.compile(
        r'(?:interviewer\s+)?(?:then\s+)?(?:asked|told)\s+(?:me\s+)?(?:to\s+)'
        r'(Explain|Describe|Define|Implement|Design|Write|Compare|'
        r'Differentiate|Discuss|Elaborate\s+on)\b\s*([^.!,\n]{3,80})',
        re.IGNORECASE,
    ), lambda m: f"{m.group(1).strip().capitalize()} {m.group(2).strip()}".rstrip('.') + '.'),

    # "asked me why <topic>" / "asked why <topic>" -> "Why <topic>?"
    (re.compile(
        r'(?:interviewer\s+)?(?:then\s+)?(?:asked|told)\s+(?:me\s+)?why\s+'
        r'([^.!,\n?]{3,80})',
        re.IGNORECASE,
    ), lambda m: f"Why {m.group(1).strip().rstrip('.')}?"),

    # "asked me about <topic>" / "asked about <topic>" -> "Explain <topic>."
    (re.compile(
        r'(?:interviewer\s+)?(?:then\s+)?(?:asked|told)\s+(?:me\s+)?about\s+'
        r'([^.!,\n]{3,80})',
        re.IGNORECASE,
    ), lambda m: f"Explain {m.group(1).strip().rstrip('.')}."),

    # "I was asked about <topic>" -> "Explain <topic>."
    (re.compile(
        r'\bI\s+was\s+asked\s+about\s+'
        r'([^.!,\n]{3,80})',
        re.IGNORECASE,
    ), lambda m: f"Explain {m.group(1).strip().rstrip('.')}."),

    # "I was asked why <topic>" -> "Why <topic>?"
    (re.compile(
        r'\bI\s+was\s+asked\s+why\s+'
        r'([^.!,\n?]{3,80})',
        re.IGNORECASE,
    ), lambda m: f"Why {m.group(1).strip().rstrip('.')}?"),

    # "next question was <topic>" / "next was about <topic>" -> "Explain <topic>."
    (re.compile(
        r'next\s+question\s+was\s+(?:about\s+)?'
        r'([^.!,\n]{3,80})',
        re.IGNORECASE,
    ), lambda m: f"Explain {m.group(1).strip().rstrip('.')}."),

    # "they asked why <topic>" -> "Why <topic>?"
    (re.compile(
        r'\bthey\s+asked\s+why\s+'
        r'([^.!,\n?]{3,80})',
        re.IGNORECASE,
    ), lambda m: f"Why {m.group(1).strip().rstrip('.')}?"),
]


# ── PATCH 2: _looks_like_question() gains a merged-word prefix fallback.
# If the clean opener regex doesn't match (because OCR repair still
# left the line glued, e.g. wordninja split it into junk fragments),
# check whether the lowercased line starts with a known opener word as
# a plain string prefix — this is intentionally permissive per your
# "keyword appears anywhere at the start, even with no spaces" rule.

def _looks_like_question(text: str) -> bool:
    s = _LABEL_PREFIX_RE.sub('', text.strip()).strip()
    if not s:
        return False
    if QUESTION_OPENER_RE.match(s):
        return True

    # PATCH: merged-word fallback — "Whatisinheritance?" or
    # "Whatdoyouunderstandfromrecursion" not split by OCR repair.
    low = s.lower()
    for head in _KNOWN_SPLIT_HEADS:
        if low.startswith(head) and len(s) > len(head) + 2:
            return True
    return False

def _is_valid_question(text: str) -> bool:
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
# ── PATCH: _candidates() gains a Tier-3 fallback that only activates
# when the normal pass (Tiers 1-2: '?' / numbered / opener-start /
# narrative) finds NOTHING at all for this text segment. It never
# overrides or competes with Tier 1-2 matches — it is strictly a
# last-resort recovery layer for narrative-heavy / OCR-mangled PDFs
# that would otherwise produce an empty list.

# Same opener vocabulary as QUESTION_OPENER_RE, used for the mid-line
# scan below (word-boundary anchored, case-insensitive).
_MIDLINE_OPENER_RE = re.compile(
    r'\b(What|Why|How|When|Where|Which|Who|Whom|Whose|Can|Could|Should|'
    r'Would|Will|Is|Are|Do|Does|Did|Explain|Describe|Define|Tell|'
    r'Compare|Differentiate|Discuss|Implement|Design|Write|List|Name|'
    r'Mention|Give)\b',
    re.IGNORECASE,
)

# ── PATCH: _candidates() gains Tier 4 — a structural-shape recovery
# layer for genuine technical-prompt SHAPES that carry no opener word
# and no '?' at all (lowercase fragments like "list memory units in
# ascending order", "binary tree or binary search tree",
# "string to query string"). Fires ONLY when Tiers 1-3 found nothing
# for the whole segment. Recovers existing text verbatim or with a
# minimal, non-inventive prefix — never fabricates new content words.

# Tier 4a: "X or Y" comparison fragments — these are almost always a
# real interview question with the question mark/opener stripped by
# OCR or copy-paste ("binary tree or binary search tree",
# "stack or queue for this problem"). Requires both sides to look like
# real noun phrases (2+ alpha words combined, no leading stopword noise)
# and the line to contain nothing but the comparison itself.
_OR_COMPARISON_RE = re.compile(
    r'^([A-Za-z][A-Za-z\s]{2,40}?)\s+or\s+([A-Za-z][A-Za-z\s]{2,40}?)[\.\?]?$',
    re.IGNORECASE,
)

# Tier 4b: bare imperative-task fragments that lost their leading verb
# capital during OCR/cleanup but are still clearly instructions ("list
# memory units in ascending order", "order them ram cd hard disk cache",
# "sort the array using merge sort"). Anchored on a closed, deliberately
# small verb set to avoid over-triggering on narration.
_BARE_IMPERATIVE_RE = re.compile(
    r'^(list|name|order|sort|arrange|draw|differentiate|compare)\b\s+'
    r'([A-Za-z][A-Za-z0-9\s,\(\)\-]{4,80})$',
    re.IGNORECASE,
)

# Tier 4c: "<topic A> to/vs/versus <topic B>" fragments missing their
# leading "Convert"/"Difference between" wrapper ("string to query
# string", "array to linked list conversion").
_AB_RELATION_RE = re.compile(
    r'^([A-Za-z][A-Za-z\s]{2,30}?)\s+(?:to|vs\.?|versus)\s+'
    r'([A-Za-z][A-Za-z\s]{2,30}?)$',
    re.IGNORECASE,
)

# Lines that are clearly narration/noise even if they match a Tier-4
# shape — explicitly excluded so Tier 4 doesn't undo Layer-2 rejection
# intent (e.g. "interviewer or me" should never recover).
_TIER4_EXCLUDE_RE = re.compile(
    r'\b(interviewer|panel|hr person|recruiter|i said|i replied|'
    r'my answer|page \d+|round \d+)\b',
    re.IGNORECASE,
)
def _try_merged_word_recovery(line: str) -> Optional[str]:
    stripped = _LABEL_PREFIX_RE.sub('', line.strip()).strip()
    low = stripped.lower()
    for head in sorted(_KNOWN_SPLIT_HEADS, key=len, reverse=True):
        if low.startswith(head) and len(stripped) > len(head) + 2:
            # Only treat as merged if there's no space right after the
            # head already (otherwise this is a normal sentence and
            # Tier 1 above would have caught it first).
            if stripped[len(head):len(head) + 1] != ' ':
                return stripped[:len(head)] + ' ' + stripped[len(head):]
    return None


def _candidates(text: str) -> List[str]:
    found = []
    fallback_pool: List[str] = []

    for raw_line in text.split('\n'):
        line = _fix_ocr(raw_line.strip())
        if not line:
            continue

        # ── Tier 0: merged-word recovery (runs before everything else,
        # on BOTH '?'-terminated and non-'?' lines) ──────────────────
        recovered_line = _try_merged_word_recovery(line)
        if recovered_line:
            line = recovered_line  # use the space-repaired version downstream

        # ── Numbered-prefix strip — now runs unconditionally, even
        # when the line ends with '?', fixing "2. Which language...?"
        # being kept with its number intact. ─────────────────────────
        num_match = re.match(r'^(?:Q\.?\s*)?\d+[\.\)]\s*(.+)', line)
        if num_match:
            line = num_match.group(1).strip()

        if line.endswith('?'):
            found.append(line)
            continue

        stripped = _LABEL_PREFIX_RE.sub('', line).strip()
        if QUESTION_OPENER_RE.match(line) or (stripped and QUESTION_OPENER_RE.match(stripped)):
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
            continue

        converted = None
        for pattern, rewrite in _NARRATIVE_PATTERNS:
            nm = pattern.search(line)
            if nm:
                converted = rewrite(nm)
                break
        if converted:
            found.append(converted.strip())
            continue

        if len(line) >= 8:
            fallback_pool.append(line)

    if found:
        return found
    # ── Tier 3: mid-line opener recovery ──────────────────────────
    recovered = []
    for line in fallback_pool:
        mm = _MIDLINE_OPENER_RE.search(line)
        if mm and mm.start() > 0:
            clipped = line[mm.start():].strip()
            if len(clipped) >= 8:
                recovered.append(clipped)
    if recovered:
        return recovered

    # ── Tier 4: structural-shape recovery (no opener, no '?') ──────
    tier4 = []
    for line in fallback_pool:
        if _TIER4_EXCLUDE_RE.search(line):
            continue

        m_or = _OR_COMPARISON_RE.match(line)
        if m_or:
            tier4.append(line.rstrip('.') + '?')
            continue

        m_imp = _BARE_IMPERATIVE_RE.match(line)
        if m_imp:
            verb = m_imp.group(1).capitalize()
            rest = m_imp.group(2).strip()
            tier4.append(f"{verb} {rest}".rstrip('.') + '.')
            continue

        m_ab = _AB_RELATION_RE.match(line)
        if m_ab:
            tier4.append(f"Difference between {m_ab.group(1).strip()} and {m_ab.group(2).strip()}.")
            continue

    return tier4

def _looks_like_question(text: str) -> bool:
    s = _LABEL_PREFIX_RE.sub('', text.strip()).strip()
    if not s:
        return False
    if QUESTION_OPENER_RE.match(s):
        return True
    low = s.lower()
    for head in _KNOWN_SPLIT_HEADS:
        if low.startswith(head) and len(s) > len(head) + 2:
            return True
    # PATCH: Tier-3 candidates are pre-clipped to start at the opener
    # word by _candidates(), so a plain opener-prefix check (already
    # covered by QUESTION_OPENER_RE.match(s) above) is sufficient —
    # no additional relaxation needed here.
    return False

def extract_questions(text: str) -> List[str]:
    raw = _candidates(text)
    valid = [c for c in raw if _is_valid_question(c)]
    unique = _deduplicate(valid)
    return unique[:40]


# ══════════════════════════════════════════════════════════════════
# ROUND BOUNDARY DETECTION (Layer 1 — the section skip)
# ══════════════════════════════════════════════════════════════════

def _find_round_boundaries(text: str) -> List[Tuple[int, int, str]]:
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
    boundaries = _find_round_boundaries(text)

    if not boundaries:
        qs = extract_questions(text)
        return [{'round_type': 'unknown', 'questions': qs, 'tips': []}] if qs else []

    segments_by_bucket: dict = {}
    order: List[str] = []
    for (start, end, bucket) in boundaries:
        if bucket == "skip":
            continue
        segments_by_bucket.setdefault(bucket, []).append(text[start:end])
        if bucket not in order:
            order.append(bucket)

    rounds = []
    for bucket in order:
        combined_text = '\n'.join(segments_by_bucket[bucket])
        rounds.append({
            'round_type': bucket,
            'questions': extract_questions(combined_text),
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

def parse_structure(text: str, filename: str = "", folder_path: str = "") -> dict:
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