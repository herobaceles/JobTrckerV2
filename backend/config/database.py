import os
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

# 1. Try loading the local file (this will safely fail silently in production)
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# 2. Grab the MONGO_URL from the system environment
# 🛠️ FIX: Added a strict check. If MONGO_URL is missing, it will crash immediately instead of running silently with old cache!
MONGO_DETAILS = os.getenv("MONGO_URL")

if not MONGO_DETAILS:
    raise ValueError("CRITICAL ERROR: MONGO_URL environment variable is completely missing or empty!")

# Initialize Client
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.job_tracker_db

# Collections setup
users_collection = database.get_collection("users")
applications_collection = database.get_collection("applications")

async def ping_database():
    await client.admin.command('ping')