from flask import Blueprint

bp = Blueprint("questions", __name__)

@bp.route("/questions")
def get_questions():
    return {"msg": "working"}