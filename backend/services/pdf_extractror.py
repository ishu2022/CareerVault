def extract_company(text):

    companies = [
        "Oracle",
        "HSBC",
        "NPCI",
        "Axxela",
        "Google",
        "Morgan Stanley",
        "Mastercard",
        "BNY",
        "Goldman Sachs",
        "Mahindra Finance"
    ]

    for company in companies:
        if company.lower() in text.lower():
            return company

    return "Unknown"


def extract_experience_type(text):

    internship_keywords = [
        "internship",
        "summer internship",
        "summer analyst",
        "stipend"
    ]

    for keyword in internship_keywords:
        if keyword.lower() in text.lower():
            return "Internship"

    return "Placement"


def extract_role(text):

    lines = text.split("\n")

    for line in lines:

        if "role:" in line.lower():
            return line.split(":")[-1].strip()

        if "job role:" in line.lower():
            return line.split(":")[-1].strip()

    return "Unknown"


def extract_student_name(text):

    lines = text.split("\n")

    for i, line in enumerate(lines):

        if "interview experience" in line.lower():

            if i + 1 < len(lines):
                return lines[i + 1].strip()

    return "Unknown"