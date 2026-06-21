import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# 1. Automatically find and load the local .env file if it exists.
# In production (Render), this safely does nothing, and it reads from system env.
load_dotenv()

# 2. Grab the MONGO_URL from the system environment
MONGO_DETAILS = os.getenv("MONGO_URL")

# Strict Check: Crash early if the environment variable is missing
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