import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests

# 1. Load environment variables safely
load_dotenv() # Works locally with .env, uses Render Env dashboard in prod

FRONTEND_URL = os.getenv("FRONTEND_URL")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# 2. Initialize FastAPI
app = FastAPI(title="Job Tracker Hub API Engine")

# 3. CORS Policy Rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Import your modular API routers and database configuration
from config.database import ping_database, users_collection, client 
from routers import auth, application, calendar

app.include_router(auth.router)
app.include_router(application.router)
app.include_router(calendar.router)

# 🛠️ ADDED: Startup event to log the database connection status
@app.on_event("startup")
async def check_database_connection():
    print("=== CHECKING DATABASE CONNECTION ===")
    try:
        # The admin command 'ping' is the standard way to test a live MongoDB connection
        await client.admin.command('ping')
        print("✅ SUCCESS: Connected to MongoDB database successfully!")
    except Exception as e:
        print("❌ ERROR: Could not connect to MongoDB database!")
        print(f"Details: {e}")
    print("====================================")


# 5. Schema for verification endpoint
class TokenPayload(BaseModel):
    token: str


# 6. Legacy/Standalone Google Verification Route
@app.post("/api/auth/google")
async def verify_google_token(payload: TokenPayload):
    try:
        id_info = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        user_name = id_info.get("name")
        user_email = id_info.get("email")

        user_doc = await users_collection.find_one({"email": user_email})
        
        if user_doc:
            db_user_id = str(user_doc["_id"])
        else:
            new_user = {
                "name": user_name,
                "email": user_email,
                "google_id": id_info.get("sub"),
                "picture": id_info.get("picture")
            }
            result = await users_collection.insert_one(new_user)
            db_user_id = str(result.inserted_id)

        return {
            "status_code": 200,
            "status": "success",
            "message": f"Successfully verified {user_name} on Python backend.",
            "user_id": db_user_id,
            "google_id": id_info.get("sub")
        }

    except Exception as e:
        print("=== GOOGLE TOKEN ERROR ===")
        print(str(e))
        print("==========================")
        raise HTTPException(status_code=401, detail=str(e))