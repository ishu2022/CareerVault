from mongoengine import connect
from dotenv import load_dotenv
import os

load_dotenv()

def connect_db():
    uri = os.getenv("MONGODB_URI")

    if not uri:
        raise Exception("❌ MONGODB_URI not found")

    connect(host=uri)
    print("✅ MongoDB Connected")