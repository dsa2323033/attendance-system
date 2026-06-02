from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import csv
from fastapi.responses import FileResponse


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    # 学生マスタ
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT UNIQUE NOT NULL,
        card_uid TEXT UNIQUE
    )
""")

    # 出席テーブル
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

init_db()

class Attendance(BaseModel):
    card_uid: str

class Student(BaseModel):
    student_id: str
    card_uid: str

@app.get("/")
def root():
    return {"message": "hello"}

@app.get("/students")
def get_students():
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    cursor.execute(
    """
    SELECT student_id, card_uid
    FROM students
    """
)
    rows = cursor.fetchall()

    conn.close()

    return [
    {
        "student_id": r[0],
        "card_uid": r[1]
    }
    for r in rows
]

@app.get("/attendance/rate/{student_id}")
def attendance_rate(student_id: str):
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    # 出席回数
    cursor.execute("""
        SELECT COUNT(*) FROM attendance
        WHERE student_id = ?
    """, (student_id,))
    attended = cursor.fetchone()[0]

    # 総日数（簡易：ユニーク日数）
    cursor.execute("""
        SELECT COUNT(DISTINCT DATE(created_at)) FROM attendance
    """)
    total_days = cursor.fetchone()[0]

    conn.close()

    rate = (attended / total_days * 100) if total_days > 0 else 0

    return {
        "student_id": student_id,
        "attended": attended,
        "total_days": total_days,
        "attendance_rate": round(rate, 2)
    }

@app.get("/attendance/ranking")
def attendance_ranking():
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    # 総授業日数
    cursor.execute("""
        SELECT COUNT(DISTINCT DATE(created_at))
        FROM attendance
    """)
    total_days = cursor.fetchone()[0]

    # 学生ごとの出席回数
    cursor.execute("""
        SELECT student_id, COUNT(*) as attended
        FROM attendance
        GROUP BY student_id
        ORDER BY attended DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    result = []

    for row in rows:
        rate = (
            row[1] / total_days * 100
            if total_days > 0 else 0
        )

        result.append({
            "student_id": row[0],
            "attended": row[1],
            "attendance_rate": round(rate, 2)
        })

    return result

@app.post("/students")
def add_student(data: Student):
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    try:
        cursor.execute(
    """
    INSERT INTO students
    (student_id, card_uid)
    VALUES (?, ?)
    """,
    (
        data.student_id,
        data.card_uid
    )
)
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return {"success": False, "message": "Student already exists"}

    conn.close()
    return {"success": True, "student_id": data.student_id}

@app.get("/attendance")
def get_attendance():
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id, student_id, created_at
    FROM attendance
    ORDER BY created_at DESC
""")
    rows = cursor.fetchall()

    conn.close()

    return [
    {
        "id": row[0],
        "student_id": row[1],
        "created_at": row[2],
        "status": "present"
    }
    for row in rows
]

@app.delete("/attendance/{attendance_id}")
def delete_attendance(attendance_id: int):
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM attendance WHERE id = ?",
        (attendance_id,)
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "deleted_id": attendance_id
    }


from datetime import datetime

@app.post("/attendance")
def post_attendance(data: Attendance):
    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    # ① card_uid → student_id を検索
    cursor.execute(
        "SELECT student_id FROM students WHERE card_uid = ?",
        (data.card_uid,)
    )
    result = cursor.fetchone()

    if not result:
        conn.close()
        return {"success": False, "message": "Card not registered"}

    student_id = result[0]

    # ② 出席登録
    cursor.execute(
        "INSERT INTO attendance (student_id, created_at) VALUES (?, ?)",
        (student_id, datetime.now().isoformat())
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "student_id": student_id
    }

@app.get("/attendance/export")
def export_attendance():

    conn = sqlite3.connect("attendance.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT student_id, created_at
        FROM attendance
        ORDER BY created_at DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    filename = "attendance_export.csv"

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow([
            "student_id",
            "created_at"
        ])

        writer.writerows(rows)

    return FileResponse(
        filename,
        media_type="text/csv",
        filename=filename
    )