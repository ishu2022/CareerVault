# api/questions.py  — production version
from flask import Blueprint, jsonify, request
from models.interview import InterviewExperience

bp = Blueprint("questions", __name__)


@bp.route("/questions/search", methods=["GET"])
def search_questions():
    """
    GET /api/v1/questions/search?q=binary+tree
    Searches all questions across all companies.

    Optional query params:
      ?company=Google
      ?year=2024
      ?round_type=technical
      ?limit=50           (default 100)
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "Provide a search term via ?q="}), 400

    company    = request.args.get("company")
    year       = request.args.get("year")
    round_type = request.args.get("round_type")
    limit      = request.args.get("limit", 100, type=int)

    # Build MongoEngine filter
    filters = {}
    if company:
        filters["company__iexact"] = company
    if year:
        filters["year"] = year

    interviews = InterviewExperience.objects(**filters)
    q_lower    = q.lower()
    matches    = []

    for doc in interviews:
        for r in doc.rounds:
            if round_type and r.round_type != round_type:
                continue
            for question in r.questions:
                if q_lower in question.lower():
                    matches.append({
                        "question":   question,
                        "company":    doc.company,
                        "year":       doc.year,
                        "round_type": r.round_type,
                        "role":       doc.role,
                        "source_id":  str(doc.id),
                    })
                    if len(matches) >= limit:
                        break

    return jsonify({
        "query":   q,
        "count":   len(matches),
        "results": matches,
    })


@bp.route("/questions/company/<string:name>", methods=["GET"])
def questions_by_company(name):
    """
    GET /api/v1/questions/company/<name>
    All questions for a company, grouped by round type.
    """
    interviews = InterviewExperience.objects(company__iexact=name)
    if not interviews:
        return jsonify({"error": f"No interviews found for: {name}"}), 404

    by_round = {}
    for doc in interviews:
        for r in doc.rounds:
            rtype = r.round_type or "unknown"
            if rtype not in by_round:
                by_round[rtype] = []
            for q in r.questions:
                by_round[rtype].append({
                    "question": q,
                    "year":     doc.year,
                })

    total = sum(len(v) for v in by_round.values())

    return jsonify({
        "company":         name,
        "total_questions": total,
        "by_round":        by_round,
    })