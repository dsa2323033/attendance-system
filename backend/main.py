from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Attendance(BaseModel):
    student_id: str

@app.get("/")
def root():
    return {"message": "hello"}

@app.get("/attendance")
def get_attendance():
    return [
        {
            "student_id": "20250001",
            "status": "present"
        }
    ]

@app.post("/attendance")
def post_attendance(data: Attendance):
    return {
        "success": True,
        "student_id": data.student_id
    }