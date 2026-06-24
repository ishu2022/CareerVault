from flask import Blueprint, jsonify, request
from datetime import datetime
from models.interview import InterviewExperience, Round

bp = Blueprint("contribute", __name__)


@bp.route("/experiences", methods=["POST"])
def submit_experience():
    """
    POST /api/v1/experiences
    Body:
    {
      "company": "Amazon",
      "role": "SDE Intern",
      "year": "2025",
      "difficulty": "medium",
      "outcome": "selected",
      "rounds": [
        {
          "round_type": "technical",
          "questions": ["Explain BFS vs DFS", "..."],
          "tips": ["Stay calm", "..."]
        }
      ],
      "overall_tips": ["Practice DSA daily"],
      "technologies": ["Java", "SQL"]
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    company = data.get("company", "").strip()
    if not company:
        return jsonify({"error": "company is required"}), 400

    difficulty = data.get("difficulty")
    if difficulty and difficulty not in ["easy", "medium", "hard"]:
        return jsonify({"error": "difficulty must be easy, medium, or hard"}), 400

    outcome = data.get("outcome")
    if outcome and outcome not in ["selected", "rejected", "unknown"]:
        return jsonify({"error": "outcome must be selected, rejected, or unknown"}), 400

    try:
        rounds_data = data.get("rounds", [])
        rounds = [
            Round(
                round_type=r.get("round_type", "technical"),
                questions=[q for q in r.get("questions", []) if q.strip()],
                tips=[t for t in r.get("tips", []) if t.strip()],
            )
            for r in rounds_data
        ]

        experience = InterviewExperience(
            company=company,
            role=data.get("role", "").strip() or None,
            year=data.get("year", "").strip() or None,
            difficulty=difficulty,
            outcome=outcome,
            rounds=rounds,
            overall_tips=[t for t in data.get("overall_tips", []) if t.strip()],
            technologies=[t for t in data.get("technologies", []) if t.strip()],
            source_file="user_submission",
            extraction_method="manual",
            created_at=datetime.utcnow(),
        )
        experience.save()

        return jsonify({
            "message": "Experience submitted successfully",
            "id": str(experience.id),
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


from bson import ObjectId
from bson.errors import InvalidId

@bp.route("/experiences/<string:experience_id>", methods=["DELETE"])
def delete_experience(experience_id):
    """
    DELETE /api/v1/experiences/<id>
    Response: { "message": "Experience deleted successfully" }
    """
    try:
        try:
            obj_id = ObjectId(experience_id)
        except InvalidId:
            return jsonify({"error": "Invalid experience id"}), 400

        experience = InterviewExperience.objects(id=obj_id).first()
        if not experience:
            return jsonify({"error": "Experience not found"}), 404

        experience.delete()
        return jsonify({"message": "Experience deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500