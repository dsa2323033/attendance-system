import { useState, useEffect } from "react";
import Camera from "./components/Camera";
import FaceRegister from "./components/FaceRegister";
import StudentPage from "./pages/StudentPage";

function App() {
  const [studentId, setStudentId] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [cardUid, setCardUid] = useState("");
  const [message, setMessage] = useState("");

  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [rateInfo, setRateInfo] = useState(null);

  useEffect(() => {
    loadAttendance();
    loadStudents();
    loadRanking();

    const interval = setInterval(() => {
      loadAttendance();
      loadStudents();
      loadRanking();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadAttendance = async () => {
    const res = await fetch("http://127.0.0.1:8001/attendance");
    const data = await res.json();
    setAttendanceList(data);
  };

  const loadStudents = async () => {
    const res = await fetch("http://127.0.0.1:8001/students");
    const data = await res.json();
    setStudents(data);
  };

  const loadRanking = async () => {
    const res = await fetch("http://127.0.0.1:8001/attendance/ranking");
    const data = await res.json();
    setRanking(data);
  };

  const loadAttendanceRate = async () => {
    if (!selectedStudent) return;

    const res = await fetch(
      `http://127.0.0.1:8001/attendance/rate/${selectedStudent}`
    );

    const data = await res.json();
    setRateInfo(data);
  };

  const receiveNfc = async (uid) => {
    try {
      const res = await fetch("http://127.0.0.1:8001/nfc/touch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_uid: uid,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStudentId(data.student_id);
        setMessage(`${data.student_id} のカードを認識しました`);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("バックエンドに接続できません");
    }
  };

  const registerAttendance = async () => {
    if (!studentId) {
      alert("学生を選択してください");
      return;
    }

    const res = await fetch("http://127.0.0.1:8001/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: studentId,
      }),
    });

    const data = await res.json();

    setMessage(data.message || "出席登録完了");

    loadAttendance();
    loadRanking();
  };

  const registerStudent = async () => {
    const res = await fetch("http://127.0.0.1:8001/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: newStudentId,
      }),
    });

    const data = await res.json();

    setMessage(data.message || "学生登録完了");
    loadStudents();
  };

  const deleteAttendance = async (id) => {
    await fetch(`http://127.0.0.1:8001/attendance/${id}`, {
      method: "DELETE",
    });

    loadAttendance();
  };

  const deleteStudent = async (studentId) => {
    await fetch(`http://127.0.0.1:8001/students/${studentId}`, {
      method: "DELETE",
    });

    loadStudents();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>出席管理システム</h1>

      <hr />

      <h2>NFCテスト</h2>

      <input
        value={cardUid}
        onChange={(e) => setCardUid(e.target.value)}
        placeholder="カードUID"
      />

      <button onClick={() => receiveNfc(cardUid)}>
        学生証確認
      </button>

      <p>{message}</p>

      <hr />

      <h2>顔認証</h2>

      <Camera studentId={studentId} />

      <hr />

      <h2>出席登録</h2>

      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      >
        <option value="">学生を選択</option>

        {students.map((student) => (
          <option
            key={student.student_id}
            value={student.student_id}
          >
            {student.student_id}
          </option>
        ))}
      </select>

      <button onClick={registerAttendance}>
        出席登録
      </button>

      <hr />

      <h2>出席一覧</h2>

      <ul>
        {attendanceList.map((item) => (
          <li key={item.id}>
            <strong>{item.student_id}</strong>
            <br />
            {item.created_at}
            <br />
            <button
              onClick={() => deleteAttendance(item.id)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      <hr />

      <StudentPage
        students={students}
        newStudentId={newStudentId}
        setNewStudentId={setNewStudentId}
        registerStudent={registerStudent}
        deleteStudent={deleteStudent}
      />

      <hr />

      <h2>顔登録</h2>

      <FaceRegister />

      <hr />

      <h2>出席率ランキング</h2>

      <ul>
        {ranking.map((item, index) => (
          <li key={item.student_id}>
            {index + 1}位　
            {item.student_id}
            （{item.attendance_rate}%）
          </li>
        ))}
      </ul>

      <hr />

      <h2>出席率確認</h2>

      <select
        value={selectedStudent}
        onChange={(e) =>
          setSelectedStudent(e.target.value)
        }
      >
        <option value="">選択してください</option>

        {students.map((student) => (
          <option
            key={student.student_id}
            value={student.student_id}
          >
            {student.student_id}
          </option>
        ))}
      </select>

      <button onClick={loadAttendanceRate}>
        出席率表示
      </button>

      {rateInfo && (
        <div>
          <p>学籍番号: {rateInfo.student_id}</p>
          <p>出席回数: {rateInfo.attended}</p>
          <p>総授業日数: {rateInfo.total_days}</p>
          <p>出席率: {rateInfo.attendance_rate}%</p>
        </div>
      )}
    </div>
  );
}

export default App;