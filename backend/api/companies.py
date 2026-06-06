from flask import Blueprint

bp = Blueprint("companies", __name__)

@bp.route("/companies")
def get_companies():
    return {"msg": "working"}