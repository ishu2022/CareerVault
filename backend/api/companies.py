# api/companies.py  — production version
from flask import Blueprint, jsonify, request
from models.interview import InterviewExperience

bp = Blueprint("companies", __name__)


def _serialise_interview(doc, include_raw=False):
    """Reusable serialiser for an InterviewExperience document."""
    data = {
        "id":         str(doc.id),
        "company":    doc.company,
        "role":       doc.role,
        "year":       doc.year,
        "difficulty": doc.difficulty,
        "outcome":    doc.outcome,
        "rounds": [
            {
                "round_type": r.round_type,
                "questions":  r.questions,
                "tips":       r.tips,
            }
            for r in doc.rounds
        ],
        "overall_tips": doc.overall_tips,
        "technologies": doc.technologies,
        "source_file":  doc.source_file,
        "created_at":   doc.created_at.isoformat() if doc.created_at else None,
    }
    if include_raw:
        data["raw_text"] = doc.raw_text
    return data


@bp.route("/companies", methods=["GET"])
def list_companies():
    """
    GET /api/v1/companies
    Returns all companies with interview count, sorted by count desc.

    Optional query params:
      ?min_count=3   only return companies with >= 3 interviews
    """
    min_count = request.args.get("min_count", 1, type=int)

    pipeline = [
        {"$group": {"_id": "$company", "count": {"$sum": 1}}},
        {"$match": {"count": {"$gte": min_count}}},
        {"$sort":  {"count": -1}},
    ]
    result = list(InterviewExperience.objects.aggregate(pipeline))

    return jsonify({
        "total_companies": len(result),
        "companies": [
            {"company": r["_id"], "count": r["count"]}
            for r in result
        ]
    })


@bp.route("/companies/<string:name>", methods=["GET"])
def get_company(name):
    """
    GET /api/v1/companies/<name>
    Returns all interviews for a company (case-insensitive).

    Optional query params:
      ?year=2024
      ?difficulty=hard
      ?outcome=selected
    """
    filters = {"company__iexact": name}

    year       = request.args.get("year")
    difficulty = request.args.get("difficulty")
    outcome    = request.args.get("outcome")

    if year:
        filters["year"] = year
    if difficulty:
        filters["difficulty"] = difficulty
    if outcome:
        filters["outcome"] = outcome

    interviews = InterviewExperience.objects(**filters).exclude("raw_text")

    if not interviews:
        return jsonify({"error": f"No interviews found for company: {name}"}), 404

    return jsonify({
        "company":    name,
        "count":      interviews.count(),
        "interviews": [_serialise_interview(i) for i in interviews],
    })


@bp.route("/companies/<string:name>/rounds", methods=["GET"])
def get_company_rounds(name):
    """
    GET /api/v1/companies/<name>/rounds
    Returns round-type breakdown for a company.
    e.g. {"coding": 12, "technical": 8, "hr": 6}
    """
    interviews = InterviewExperience.objects(company__iexact=name)
    if not interviews:
        return jsonify({"error": f"No interviews found for company: {name}"}), 404

    round_counts = {}
    for interview in interviews:
        for r in interview.rounds:
            t = r.round_type or "unknown"
            round_counts[t] = round_counts.get(t, 0) + 1

    return jsonify({
        "company":      name,
        "round_counts": round_counts,
        "total_rounds": sum(round_counts.values()),
    })


@bp.route("/companies/<string:name>/questions", methods=["GET"])
def get_company_questions(name):
    """
    GET /api/v1/companies/<name>/questions
    Returns all questions ever asked at this company, deduped.
    """
    interviews = InterviewExperience.objects(company__iexact=name)
    if not interviews:
        return jsonify({"error": f"No interviews found for company: {name}"}), 404

    seen      = set()
    questions = []
    for doc in interviews:
        for r in doc.rounds:
            for q in r.questions:
                if q and q not in seen:
                    seen.add(q)
                    questions.append({
                        "question":   q,
                        "round_type": r.round_type,
                        "year":       doc.year,
                    })

    return jsonify({
        "company":          name,
        "total_questions":  len(questions),
        "questions":        questions,
    })