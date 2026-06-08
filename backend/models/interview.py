# models/interview.py — using mongoengine
from mongoengine import *
from datetime import datetime

class Round(EmbeddedDocument):
    round_number = IntField()
    round_type = StringField(required=True)
    questions = ListField(StringField())
    tips = ListField(StringField())
    duration_minutes = IntField()

class InterviewExperience(Document):
    # Source info
    company = StringField(required=True, index=True)
    role = StringField()
    year = StringField()
    
    # Outcome
    difficulty = StringField(choices=['easy', 'medium', 'hard'])
    outcome = StringField(choices=['selected', 'rejected', 'unknown'])
    
    # Content
    rounds = EmbeddedDocumentListField(Round)
    overall_tips = ListField(StringField())
    technologies = ListField(StringField())
    
    # Meta
    source_file = StringField()         # original PDF filename
    extraction_method = StringField()   # 'rule_based' or 'ai'
    raw_text = StringField()            # always store original
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'interviews',
        'indexes': ['company', 'role', 'technologies', 'year']
    }