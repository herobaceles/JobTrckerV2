import os
from fastapi import APIRouter, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
from models.application import TokenPayload
from config.database import users_collection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@app_router := router.post("/google")
async def verify_google_token(payload: TokenPayload):
    try:
        id_info = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        google_id = id_info.get("sub")
        email = id_info.get("email")
        name = id_info.get("name")

        user = await users_collection.find_one({"google_id": google_id})
        
        if not user:
            new_user = {
                "email": email,
                "name": name,
                "google_id": google_id,
            }
            result = await users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
            print(f"🆕 Registered brand new user in MongoDB: {email}")
        else:
            user_id = str(user["_id"])
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"name": name}}
            )
            print(f"🔄 Authenticated existing user from MongoDB: {email}")

        return {
            "status": "success",
            "user_id": user_id,
            "google_id": google_id,
            "message": f"Successfully verified and synced {name} to MongoDB.",
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))