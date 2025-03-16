# backend/db/mongodb.py
import os
from pymongo import MongoClient

MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST")

MONGODB_URL = f"mongodb+srv://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_HOST}/?retryWrites=true&w=majority&appName=synapsex-cluster-0001"

ENV = os.getenv("ENV", "dev")

if ENV.lower() == "dev" or ENV.lower() == "prod":
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(MONGODB_URL, tlsCAFile=ca)
    db = client["sakshi_db"]
else:
    print("Connecting to local MongoDB...")
    client = MongoClient("mongodb://localhost:27017")
    db = client["sakshi_db"]
