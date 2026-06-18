# api/stats.py
from flask import Blueprint, jsonify
from models.interview import InterviewExperience

bp = Blueprint("stats", __name__)

@bp.route('/stats', methods=['GET'])
def get_stats():
    total_interviews = InterviewExperience.objects.count()
    companies        = len(InterviewExperience.objects.distinct('company'))

    all_docs         = InterviewExperience.objects.only('rounds')
    total_rounds     = sum(len(d.rounds) for d in all_docs)
    total_questions  = sum(
        len(r.questions) for d in all_docs for r in d.rounds
    )

    by_company = list(InterviewExperience.objects.aggregate([
        {"$group": {"_id": "$company", "count": {"$sum": 1}}},
        {"$sort":  {"count": -1}},
        {"$limit": 10}
    ]))

    by_year = list(InterviewExperience.objects.aggregate([
        {"$group": {"_id": "$year", "count": {"$sum": 1}}},
        {"$sort":  {"_id": -1}}
    ]))

    return jsonify({
        "total_interviews": total_interviews,
        "total_companies":  companies,
        "total_rounds":     total_rounds,
        "total_questions":  total_questions,
        "by_company":       [{"company": r["_id"], "count": r["count"]} for r in by_company],
        "by_year":          [{"year": r["_id"], "count": r["count"]} for r in by_year],
    })