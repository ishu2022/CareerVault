# backend/api/companies.py
from flask import Blueprint, jsonify
from models.interview import InterviewExperience

bp = Blueprint("companies", __name__)


@bp.route("/companies", methods=["GET"])
def get_companies():
    """
    GET /api/v1/companies
    Response: ["Amazon", "Microsoft", "Goldman Sachs", ...]
    Sorted alphabetically.
    """
    try:
        names = sorted(InterviewExperience.objects.distinct("company"))
        return jsonify(names)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/companies/<string:name>", methods=["GET"])
def get_company(name):
    """
    GET /api/v1/companies/<name>
    Response:
    {
      "company": "Amazon",
      "experiences": [
        {
          "id":         "65f...",
          "role":       "SDE Intern",
          "year":       "2025",
          "difficulty": "medium",
          "outcome":    "selected",
          "rounds": [
            { "round_type": "coding", "questions": [...], "tips": [] }
          ]
        }
      ]
    }
    """
    try:
        docs = InterviewExperience.objects(
            company__iexact=name
        ).exclude("raw_text").order_by("-year")

        if not docs:
            return jsonify({"error": "Company not found"}), 404

        experiences = [
            {
                "id":         str(d.id),
                "role":       d.role,
                "year":       d.year,
                "difficulty": d.difficulty,
                "outcome":    d.outcome,
                "rounds": [
                    {
                        "round_type": r.round_type,
                        "questions":  r.questions,
                        "tips":       r.tips,
                    }
                    for r in d.rounds
                ],
            }
            for d in docs
        ]

        return jsonify({
            "company":     docs[0].company,
            "experiences": experiences,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500