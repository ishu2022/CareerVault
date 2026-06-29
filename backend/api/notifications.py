from flask import Blueprint, jsonify, request
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

from models.notification import Notification

bp = Blueprint("notifications", __name__)


# ---------------------------------------------------------------------------
# GET /api/v1/notifications
# Query param: userId (Firebase UID)
# ---------------------------------------------------------------------------
@bp.route("/notifications", methods=["GET"])
def get_notifications():
    user_id = request.args.get("userId", "").strip()
    if not user_id:
        return jsonify({"error": "userId query param is required"}), 400

    try:
        notifications = Notification.objects(userId=user_id).order_by("-createdAt")
        return jsonify([
            {
                "id":        str(n.id),
                "userId":    n.userId,
                "title":     n.title,
                "message":   n.message,
                "type":      n.type,
                "isRead":    n.isRead,
                "createdAt": n.createdAt.isoformat(),
            }
            for n in notifications
        ]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# PATCH /api/v1/notifications/:id/read
# ---------------------------------------------------------------------------
@bp.route("/notifications/<string:notification_id>/read", methods=["PATCH"])
def mark_one_read(notification_id):
    try:
        obj_id = ObjectId(notification_id)
    except InvalidId:
        return jsonify({"error": "Invalid notification id"}), 400

    try:
        notification = Notification.objects(id=obj_id).first()
        if not notification:
            return jsonify({"error": "Notification not found"}), 404

        notification.update(isRead=True)
        return jsonify({"message": "Notification marked as read"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# PATCH /api/v1/notifications/read-all
# Body: { "userId": "<firebase-uid>" }
# ---------------------------------------------------------------------------
@bp.route("/notifications/read-all", methods=["PATCH"])
def mark_all_read():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    user_id = data.get("userId", "").strip()
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    try:
        Notification.objects(userId=user_id, isRead=False).update(set__isRead=True)
        return jsonify({"message": "All notifications marked as read"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# POST /api/v1/notifications
# Body: { "userId", "title", "message", "type" }
# ---------------------------------------------------------------------------
@bp.route("/notifications", methods=["POST"])
def create_notification():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    user_id = data.get("userId", "").strip()
    title   = data.get("title",  "").strip()
    message = data.get("message","").strip()
    n_type  = data.get("type", "general").strip()

    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    if not title:
        return jsonify({"error": "title is required"}), 400
    if not message:
        return jsonify({"error": "message is required"}), 400

    valid_types = ["first_login", "experience_submitted", "experience_deleted",
                   "company_added", "general"]
    if n_type not in valid_types:
        return jsonify({"error": f"type must be one of {valid_types}"}), 400

    try:
        notification = Notification(
            userId=user_id,
            title=title,
            message=message,
            type=n_type,
            createdAt=datetime.utcnow(),
        )
        notification.save()
        return jsonify({
            "message": "Notification created",
            "id":      str(notification.id),
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500