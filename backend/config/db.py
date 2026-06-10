from mongoengine import connect
import os

def connect_db():
    connect(host=os.getenv("MONGO_URI"))
    print("✅ MongoDB Connected")