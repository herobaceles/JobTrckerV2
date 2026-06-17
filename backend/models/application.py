from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, Annotated

# Helper type to automatically convert MongoDB ObjectId instances into clean strings
PyObjectId = Annotated[str, BeforeValidator(str)]

class TokenPayload(BaseModel):
    token: str

# Base structural fields for a Job Application record
class ApplicationCreate(BaseModel):
    company: str
    role: str  # Position
    location: Optional[str] = ""
    status: str = "Applied"
    date: str
    nextStep: Optional[str] = ""
    # 🛠️ ADD THESE TWO NEW FIELDS HERE:
    salary: Optional[str] = ""
    statusChangeDate: Optional[str] = ""

# Output Schema structure sent back to Next.js UI layout
class ApplicationResponse(ApplicationCreate):
    # Map MongoDB's incoming '_id' field directly into a frontend-friendly 'id' string
    id: PyObjectId = Field(alias="_id")
    user_id: str

    class Config:
        # Allows Pydantic to read standard dictionaries OR ORM-style object fields
        populate_by_name = True