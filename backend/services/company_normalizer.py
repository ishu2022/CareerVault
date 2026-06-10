# services/company_normalizer.py

# ──────────────────────────────────────────────────────────────────
# Canonical name map
# Every key is a lowercase variant that appears in Drive folder names.
# Every value is the correct display name to store in MongoDB.
# ──────────────────────────────────────────────────────────────────

COMPANY_NAME_MAP = {
    # Deutsche Bank variants
    "deutsche bank":       "Deutsche Bank",
    "deustche bank":       "Deutsche Bank",
    "deutche bank":        "Deutsche Bank",
    "db":                  "Deutsche Bank",

    # JPMorgan variants
    "jpmc":                "JPMorgan Chase",
    "jp morgan":           "JPMorgan Chase",
    "jp morgan chase":     "JPMorgan Chase",
    "j.p. morgan":         "JPMorgan Chase",
    "j.pmorgan":           "JPMorgan Chase",
    "j p morgan":          "JPMorgan Chase",
    "jpmorgan":            "JPMorgan Chase",

    # BNY Mellon variants
    "bny":                 "BNY Mellon",
    "bny mellon":          "BNY Mellon",
    "bnym":                "BNY Mellon",
    "bank of new york":    "BNY Mellon",

    # Goldman Sachs variants
    "goldman sachs":       "Goldman Sachs",
    "goldman":             "Goldman Sachs",
    "gs":                  "Goldman Sachs",

    # Morgan Stanley variants
    "morgan stanley":      "Morgan Stanley",

    # Citi variants
    "citi":                "Citi",
    "citicorp":            "Citi",
    "citi corp":           "Citi",
    "citibank":            "Citi",
    "citigroup":           "Citi",

    # Wells Fargo variants
    "wells fargo":         "Wells Fargo",

    # Barclays variants
    "barclays":            "Barclays",

    # HSBC variants
    "hsbc":                "HSBC",

    # D.E. Shaw variants
    "de shaw":             "D.E. Shaw",
    "d.e. shaw":           "D.E. Shaw",
    "de shaw & co":        "D.E. Shaw",
    "d e shaw":            "D.E. Shaw",

    # Hilti variants
    "hilti":               "Hilti",
    "htsi":                "Hilti",
    "hilti htsi":          "Hilti",

    # SAP variants
    "sap":                 "SAP Labs",
    "sap labs":            "SAP Labs",

    # Google variants
    "google":              "Google",

    # Microsoft variants
    "microsoft":           "Microsoft",

    # Amazon variants
    "amazon":              "Amazon",

    # Oracle variants
    "oracle":              "Oracle",

    # UBS variants
    "ubs":                 "UBS",

    # Texas Instruments variants
    "texas instruments":   "Texas Instruments",
    "ti":                  "Texas Instruments",

    # Bank of America variants
    "bank of america":     "Bank of America",
    "bofa":                "Bank of America",
    "baml":                "Bank of America",
    "bank of america ml":  "Bank of America",

    # PwC variants
    "pwc":                 "PwC",
    "pricewaterhousecoopers": "PwC",

    # Deloitte variants
    "deloitte":            "Deloitte",
    "deloitte usi":        "Deloitte",
    "deloitte india":      "Deloitte",

    # NPCI variants
    "npci":                "NPCI",

    # Tracelink variants
    "tracelink":           "Tracelink",

    # Fractal variants
    "fractal":             "Fractal Analytics",
    "fractal analytics":   "Fractal Analytics",

    # Visa variants
    "visa":                "Visa",

    # HDFC variants
    "hdfc":                "HDFC Bank",
    "hdfc bank":           "HDFC Bank",

    # Kotak variants
    "kotak":               "Kotak",
    "kotak life":          "Kotak",

    # MSCI variants
    "msci":                "MSCI",

    # Russell Investments variants
    "russell investments": "Russell Investments",
    "russell":             "Russell Investments",

    # Mahindra variants
    "mahindra":            "Mahindra",
    "mahindra finance":    "Mahindra Finance",
    "mahindra and mahindra": "Mahindra",

    # Fiserv variants
    "fiserv":              "Fiserv",

    # Samsung variants
    "samsung":             "Samsung",

    # Credit Suisse variants
    "credit suisse":       "Credit Suisse",

    # Nomura variants
    "nomura":              "Nomura",

    # Nvidia variants
    "nvidia":              "NVIDIA",

    # IBM variants
    "ibm":                 "IBM",

    # Infosys variants
    "infosys":             "Infosys",

    # Accenture variants
    "accenture":           "Accenture",

    # Wipro variants
    "wipro":               "Wipro",

    # Cisco variants
    "cisco":               "Cisco",

    # TCS variants
    "tcs":                 "TCS",

    # Proctor & Gamble variants
    "proctor & gamble":    "Procter & Gamble",
    "p&g":                 "Procter & Gamble",

    # Siemens variants
    "siemens":             "Siemens",

    # HILTI / BNY / HSBC uppercase forms handled by lowercasing below
}


def normalize_company_name(raw: str) -> str:
    """
    Takes any raw company name from Drive folder path or text extraction
    and returns the canonical display name.

    Examples:
        "Deustche Bank"  → "Deutsche Bank"
        "JPMC"           → "JPMorgan Chase"
        "BNY"            → "BNY Mellon"
        "DE SHAW"        → "D.E. Shaw"
        "HILTI"          → "Hilti"
        "PWC"            → "PwC"

    Returns the original string (title-cased) if no mapping found.
    """
    if not raw or raw.strip() == "":
        return "Unknown"

    low = raw.strip().lower()

    # Direct lookup
    if low in COMPANY_NAME_MAP:
        return COMPANY_NAME_MAP[low]

    # Partial match — handles cases like "Goldman Sachs Interview"
    for key, canonical in COMPANY_NAME_MAP.items():
        if key in low:
            return canonical

    # No match — return title-cased original so it looks clean
    return raw.strip().title()