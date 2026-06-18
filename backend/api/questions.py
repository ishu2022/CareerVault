# backend/api/questions.py
from flask import Blueprint, jsonify, request
from models.interview import InterviewExperience

bp = Blueprint("questions", __name__)


@bp.route("/questions", methods=["GET"])
def search_questions():
    """
    GET /api/v1/questions?keyword=graph
    Response:
    [
      { "company": "Amazon", "question": "Graph traversal using BFS" },
      ...
    ]
    """
    keyword = request.args.get("keyword", "").strip()
    if not keyword:
        return jsonify({"error": "Provide ?keyword="}), 400

    try:
        docs    = InterviewExperience.objects.only("company", "rounds")
        results = []
        kw      = keyword.lower()

        for doc in docs:
            for r in doc.rounds:
                for q in r.questions:
                    if kw in q.lower():
                        results.append({
                            "company":    doc.company,
                            "question":   q,
                            "round_type": r.round_type,
                        })

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500