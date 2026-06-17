from fastapi import APIRouter, HTTPException, Header, Body  # 🛠️ UPDATED: Added Body import
from typing import List
from models.application import ApplicationCreate, ApplicationResponse
from config.database import applications_collection
from bson import ObjectId

router = APIRouter(prefix="/api/applications", tags=["Applications Tracker"])

@router.post("", response_model=ApplicationResponse)
async def add_application(payload: ApplicationCreate, x_user_id: str = Header(..., alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing authorization identity context header.")
        
    try:
        application_dict = payload.dict()
        application_dict["user_id"] = x_user_id
        
        result = await applications_collection.insert_one(application_dict)
        application_dict["id"] = str(result.inserted_id)
        
        return application_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database persistent log fault: {str(e)}")

@router.get("", response_model=List[ApplicationResponse])
async def get_user_applications(x_user_id: str = Header(..., alias="X-User-Id")):
    print("================================")
    print("X-User-Id received:", x_user_id)
    print("================================")

    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing tracking identity.")
        
    try:
        cursor = applications_collection.find({"user_id": x_user_id})
        user_jobs = []

        async for doc in cursor:
            print("FOUND DOC:", doc)

            doc["id"] = str(doc["_id"])
            user_jobs.append(doc)

        print("TOTAL JOBS:", len(user_jobs))

        return user_jobs

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
@router.delete("/{id}")
async def delete_application(id: str, x_user_id: str = Header(..., alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing verification context.")
        
    try:
        mongo_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application database identifier format.")

    result = await applications_collection.delete_one({"_id": mongo_id, "user_id": x_user_id})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404, 
            detail="Application record not found or you do not have permission to delete it."
        )

    return {"status": "success", "message": "Application profile entry removed successfully."}

# ==========================================
# 🛠️ ADDED: NEW UPDATE (PUT) ROUTE FOR INLINE CHANGES
# ==========================================
@router.put("/{id}", response_model=ApplicationResponse)
async def update_application(
    id: str, 
    updated_fields: dict = Body(...), 
    x_user_id: str = Header(..., alias="X-User-Id")
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing authentication identity context header.")
        
    try:
        mongo_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid database identifier format.")

    # Guard clause: ensure system identifiers aren't mutated by incoming user payloads
    updated_fields.pop("id", None)
    updated_fields.pop("_id", None)
    updated_fields.pop("user_id", None)

    # Perform atomic update matching target id AND user id context
    result = await applications_collection.find_one_and_update(
        {"_id": mongo_id, "user_id": x_user_id},
        {"$set": updated_fields},
        return_document=True  # Instructs Motor to return the revised dictionary data object
    )

    if not result:
        raise HTTPException(
            status_code=404, 
            detail="Application profile record not found or permission denied."
        )

    # Format MongoDB's native ObjectId string back to uniform frontend interface 'id'
    result["id"] = str(result["_id"])
    return result