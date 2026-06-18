from dotenv import load_dotenv
load_dotenv()

import os
from mongoengine import connect

db = connect(host=os.getenv("MONGODB_URI"))

print("Database name:", db.get_database().name)