function StudentPage({
  students,
  newStudentId,
  setNewStudentId,
  registerStudent,
  deleteStudent,
}) {
  return (
    <>
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
    </>
  );
}

export default StudentPage;