# api/stats.py  — NEW FILE
# Register in app.py:
#   from api.stats import bp as stats_bp
#   app.register_blueprint(stats_bp, url_prefix="/api/v1")

from flask import Blueprint, jsonify
from models.interview import InterviewExperience
from collections import Counter

bp = Blueprint("stats", __name__)


@bp.route("/stats", methods=["GET"])
def dashboard_stats():
    """
    GET /api/v1/stats
    Returns all dashboard metrics in a single call.
    This is what your React dashboard page will call on load.
    """
    docs = list(InterviewExperience.objects())

    # Basic counts
    total_docs      = len(docs)
    total_companies = len({d.company for d in docs})
    total_rounds    = sum(len(d.rounds) for d in docs)
    total_questions = sum(
        len(r.questions)
        for d in docs
        for r in d.rounds
    )

    # Top 10 companies
    company_counts = Counter(d.company for d in docs)
    top_companies  = [
        {"company": c, "count": n}
        for c, n in company_counts.most_common(10)
    ]

    # Year distribution
    year_dist = Counter(d.year or "unknown" for d in docs)

    # Difficulty breakdown
    difficulty_dist = Counter(d.difficulty or "unknown" for d in docs)

    # Outcome breakdown
    outcome_dist = Counter(d.outcome or "unknown" for d in docs)

    # Round type breakdown
    round_dist = Counter()
    for d in docs:
        for r in d.rounds:
            round_dist[r.round_type or "unknown"] += 1

    # Recent additions (last 10 inserted)
    recent = InterviewExperience.objects().order_by("-created_at").limit(10)
    recent_list = [
        {
            "company": d.company,
            "role":    d.role,
            "year":    d.year,
            "id":      str(d.id),
        }
        for d in recent
    ]

    return jsonify({
        "overview": {
            "total_interviews": total_docs,
            "total_companies":  total_companies,
            "total_rounds":     total_rounds,
            "total_questions":  total_questions,
        },
        "top_companies":   top_companies,
        "year_distribution":       dict(year_dist),
        "difficulty_distribution": dict(difficulty_dist),
        "outcome_distribution":    dict(outcome_dist),
        "round_distribution":      dict(round_dist),
        "recent_additions":        recent_list,
    })


@bp.route("/stats/company/<string:name>", methods=["GET"])
def company_stats(name):
    """
    GET /api/v1/stats/company/<name>
    Detailed stats for one company.
    """
    docs = list(InterviewExperience.objects(company__iexact=name))
    if not docs:
        return jsonify({"error": f"No data for: {name}"}), 404

    total_q = sum(len(r.questions) for d in docs for r in d.rounds)
    round_dist = Counter()
    for d in docs:
        for r in d.rounds:
            round_dist[r.round_type or "unknown"] += 1

    return jsonify({
        "company":           name,
        "total_interviews":  len(docs),
        "total_questions":   total_q,
        "round_breakdown":   dict(round_dist),
        "year_breakdown":    dict(Counter(d.year or "unknown" for d in docs)),
        "difficulty_counts": dict(Counter(d.difficulty or "unknown" for d in docs)),
        "outcome_counts":    dict(Counter(d.outcome or "unknown" for d in docs)),
    })