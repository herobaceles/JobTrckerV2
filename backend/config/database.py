import os
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv(Path(__file__).parent.parent / ".env")

MONGO_DETAILS = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Initialize Client
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.job_tracker_db

# Collections setup
users_collection = database.get_collection("users")
applications_collection = database.get_collection("applications")

async def ping_database():
    await client.admin.command('ping')