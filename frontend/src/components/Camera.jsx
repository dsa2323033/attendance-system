import { useEffect, useRef, useState } from "react";

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
        alert("カメラを起動できません");
      }
    }

    startCamera();
  }, []);

  const capture = async () => {
    if (!studentId) {
      alert("学籍番号を入力してください");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();

      formData.append("student_id", studentId);
      formData.append("image", blob, "face.jpg");

      const res = await fetch(
        "http://127.0.0.1:8001/face/register",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      alert(data.message);
    }, "image/jpeg");
  };

  return (
    <div>
      <h2>顔登録</h2>

      <input
        type="text"
        placeholder="学籍番号"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />

      <br />
      <br />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="640"
        height="480"
      />

      <br />
      <br />

      <button onClick={capture}>
        撮影して登録
      </button>

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default Camera;