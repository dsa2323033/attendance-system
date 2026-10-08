import { useEffect, useRef } from "react";

function FaceRegister() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  const registerFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("カメラ取得失敗");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("画像取得失敗");
        return;
      }

      const formData = new FormData();
      formData.append("student_id", "2323033");
      formData.append("image", blob, "face.jpg");

      try {
        const response = await fetch(
          "http://127.0.0.1:8001/face/register",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        console.log(result);

        alert("顔登録完了");
      } catch (err) {
        console.error(err);
        alert("登録失敗");
      }
    }, "image/jpeg");
  };

  return (
    <div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="640"
        height="480"
      />

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      <br />

      <button onClick={registerFace}>
        顔登録
      </button>
    </div>
  );
}

export default FaceRegister;