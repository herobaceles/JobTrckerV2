import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests

# 1. Load environment variables first so routers & configurations can read them
load_dotenv(Path(__file__).parent / ".env")
FRONTEND_URL = os.getenv("FRONTEND_URL")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# 2. Initialize FastAPI
app = FastAPI(title="Job Tracker Hub API Engine")

# 3. CORS Policy Rules
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL else ["*"], # Safe fallback if env isn't loaded
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Import and include your modular API routers
# 🛠️ FIXED: Imported 'users_collection' directly from your config file
from config.database import ping_database, users_collection 
from routers import auth, application, calendar

app.include_router(auth.router)
app.include_router(application.router)
app.include_router(calendar.router)


# 5. Schema for verification endpoint
class TokenPayload(BaseModel):
    token: str


# 6. Legacy/Standalone Google Verification Route
@app.post("/api/auth/google")
async def verify_google_token(payload: TokenPayload):
    try:
        # Verify Google ID token
        id_info = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        # Debug information
        print("=== GOOGLE TOKEN VERIFIED ===")
        print("NAME :", id_info.get("name"))
        print("EMAIL:", id_info.get("email"))
        print("AUD  :", id_info.get("aud"))
        print("SUB  :", id_info.get("sub"))
        print("============================")

        user_name = id_info.get("name")
        user_email = id_info.get("email")

        # 🛠️ DATABASE LOOKUP: Query your native users_collection directly
        user_doc = await users_collection.find_one({"email": user_email})
        
        if user_doc:
            db_user_id = str(user_doc["_id"])  # Grabs the "6a2eb..." hash string
        else:
            # Auto-register new users into MongoDB collection if logging in for the first time
            new_user = {
                "name": user_name,
                "email": user_email,
                "google_id": id_info.get("sub"),
                "picture": id_info.get("picture")
            }
            result = await users_collection.insert_one(new_user)
            db_user_id = str(result.inserted_id)

        # 🛠️ SUCCESS: Pass back the exact native identifierNextAuth is expecting
        return {
            "status_code": 200,
            "status": "success",
            "message": f"Successfully verified {user_name} on Python backend.",
            "user_id": db_user_id,             # NextAuth maps this directly to token.userId!
            "google_id": id_info.get("sub")
        }

    except Exception as e:
        print("=== GOOGLE TOKEN ERROR ===")
        print(str(e))
        print("==========================")

        raise HTTPException(
            status_code=401,
            detail=str(e)
        )