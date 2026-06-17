from fastapi import APIRouter, HTTPException, Header
from typing import List
from bson import ObjectId
from models.event import CalendarEventCreate, CalendarEventResponse

# 🛠️ CHANGED: Import 'database' instead of 'db' from your config file
from config.database import database

router = APIRouter(prefix="/api/events", tags=["Calendar Events"])

# 🛠️ CHANGED: Grab the collection using your setup's standard method format
events_collection = database.get_collection("calendar_events")

@router.post("", response_model=CalendarEventResponse)
async def create_event(payload: CalendarEventCreate, x_user_id: str = Header(..., alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Invalid session identity context.")
    
    try:
        event_dict = payload.dict()
        event_dict["user_id"] = x_user_id
        
        result = await events_collection.insert_one(event_dict)
        event_dict["id"] = str(result.inserted_id)
        return event_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[CalendarEventResponse])
async def get_user_events(x_user_id: str = Header(..., alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized.")
        
    try:
        cursor = events_collection.find({"user_id": x_user_id})
        events_list = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            events_list.append(doc)
        return events_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
async def delete_event(id: str, x_user_id: str = Header(..., alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized.")
    try:
        mongo_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid identifier format.")

    result = await events_collection.delete_one({"_id": mongo_id, "user_id": x_user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event record not found.")
        
    return {"status": "success", "message": "Calendar event entry cleared."}