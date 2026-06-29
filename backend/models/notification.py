from mongoengine import Document, StringField, BooleanField, DateTimeField
from datetime import datetime


class Notification(Document):
    meta = {"collection": "notifications", "ordering": ["-created_at"]}

    userId    = StringField(required=True)          # Firebase UID
    title     = StringField(required=True)
    message   = StringField(required=True)
    type      = StringField(
        required=True,
        choices=["first_login", "experience_submitted", "experience_deleted",
                 "company_added", "general"],
        default="general",
    )
    isRead    = BooleanField(default=False)
    createdAt = DateTimeField(default=datetime.utcnow)