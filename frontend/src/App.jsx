import { useState, useEffect } from 'react'

function App() {
  const [studentId, setStudentId] = useState('')
  const [newStudentId, setNewStudentId] = useState('')
  const [message, setMessage] = useState('')
  const [attendanceList, setAttendanceList] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [rateInfo, setRateInfo] = useState(null)
  const [ranking, setRanking] = useState([])

  const loadAttendance = async () => {
    const res = await fetch('http://127.0.0.1:8001/attendance')
    const data = await res.json()
    setAttendanceList(data)
  }

  const loadStudents = async () => {
    const res = await fetch('http://127.0.0.1:8001/students')
    const data = await res.json()
    setStudents(data)
  }
  const loadRanking = async () => {
  const res = await fetch(
    'http://127.0.0.1:8001/attendance/ranking'
  )

  const data = await res.json()

  setRanking(data)
}

  const loadAttendanceRate = async () => {
    if (!selectedStudent) return

    const res = await fetch(
      `http://127.0.0.1:8001/attendance/rate/${selectedStudent}`
    )

    const data = await res.json()
    setRateInfo(data)
  }

  useEffect(() => {
  loadAttendance()
  loadStudents()
  loadRanking()
}, [])

  const registerAttendance = async () => {
    const res = await fetch('http://127.0.0.1:8001/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: studentId
      })
    })

    const data = await res.json()

    setMessage(data.message || '出席登録完了')

    loadAttendance()
loadRanking()
  }

  const registerStudent = async () => {
    const deleteStudent = async (studentId) => {
  await fetch(
    `http://127.0.0.1:8001/students/${studentId}`,
    {
      method: 'DELETE'
    }
  )

  loadStudents()
}
    const deleteAttendance = async (id) => {
  await fetch(
    `http://127.0.0.1:8001/attendance/${id}`,
    {
      method: 'DELETE'
    }
  )

  loadAttendance()
}
    const res = await fetch('http://127.0.0.1:8001/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: newStudentId
      })
    })

    const data = await res.json()

    setMessage(data.message || '学生登録完了')

    loadStudents()
  }

  const deleteStudent = async (studentId) => {
    await fetch(
      `http://127.0.0.1:8001/students/${studentId}`,
      {
        method: 'DELETE'
      }
    )

    loadStudents()
  }

  return (
    <div style={{ padding: '30px' }}>
      <h1>出席管理システム</h1>

      <select
  value={studentId}
  onChange={(e) => setStudentId(e.target.value)}
>
  <option value="">
    学生を選択
  </option>

  {students.map((student, index) => (
    <option
      key={index}
      value={student.student_id}
    >
      {student.student_id}
    </option>
  ))}
</select>

      <button onClick={registerAttendance}>
        出席登録
      </button>

      <p>{message}</p>

      <hr />

      <h2>出席一覧</h2>

      <ul>
        {attendanceList.map((item, index) => (
          <li key={index}>
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

      <h2>学生登録</h2>

      <input
        value={newStudentId}
        onChange={(e) => setNewStudentId(e.target.value)}
        placeholder="新しい学籍番号"
      />

      <button onClick={registerStudent}>
        学生登録
      </button>

      <hr />

      <h2>登録学生</h2>

      <ul>
  {students.map((student, index) => (
    <li key={index}>
      {student.student_id}

      <button
        onClick={() =>
          deleteStudent(student.student_id)
        }
      >
        削除
      </button>
    </li>
  ))}
</ul>
<hr />

<h2>出席率ランキング</h2>

<ul>
  {ranking.map((item, index) => (
    <li key={index}>
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
        onChange={(e) => setSelectedStudent(e.target.value)}
      >
        <option value="">選択してください</option>

        {students.map((student, index) => (
          <option
            key={index}
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
  )
}

export default App