from pydantic import BaseModel, Field
from typing import Optional

class CalendarEventCreate(BaseModel):
    title: str = Field(..., example="Technical Phone Screen")
    company: str = Field(..., example="Stripe")
    date: str = Field(..., example="2026-06-15")  # Stored in YYYY-MM-DD format
    time: Optional[str] = Field("All Day", example="2:00 PM")
    
    # ⚡ ADDED: Dynamic text block field to save full preparation responses, architectures, or STAR outlines
    notes: Optional[str] = Field("", example="Review STAR method questions regarding customer obsession.")

    class Config:
        # Schema configuration example to keep FastAPI's interactive /docs dashboard clean
        json_schema_extra = {
            "example": {
                "title": "Prep: Amazon Leadership Principles",
                "company": "Interview Notes Note",
                "date": "2026-06-19",
                "time": "All Day",
                "notes": "Focused heavily on ownership, deliver results, and system architecture fundamentals."
            }
        }

class CalendarEventResponse(CalendarEventCreate):
    id: str