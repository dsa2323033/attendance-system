import { useEffect, useRef } from "react";

function Camera({ studentId }) {
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


  const captureImage = async () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("カメラ取得失敗");
      return;
    }

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);


    canvas.toBlob(async (blob) => {

      if (!blob) {
        alert("画像取得失敗");
        return;
      }


      const formData = new FormData();

      formData.append(
        "image",
        blob,
        "face.jpg"
      );


      try {

        const response = await fetch(
          "http://127.0.0.1:8001/face/verify",
          {
            method: "POST",
            body: formData,
          }
        );


        const result = await response.json();

        console.log("face result:", result);
        console.log("NFC studentId:", studentId);
        console.log("Face studentId:", result.student_id);
        console.log("Score:", result.score);


        if (
         result.student_id &&
         // TODO: Raspberry Pi実機連携後に有効化
         // result.student_id === studentId &&
         result.score >= 0.2
         ){


          const attendanceResponse =
            await fetch(
              "http://127.0.0.1:8001/attendance",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                student_id: studentId,
   }),
              }
            );


          const attendanceResult =
            await attendanceResponse.json();


          console.log(
            "attendance:",
            attendanceResult
          );


          alert(
            result.student_id +
            " さんの出席を登録しました"
          );


        } else {

          alert(
            "本人確認失敗"
          );

        }


      } catch(err) {

        console.error(err);

        alert(
          "通信エラー: " + err
        );

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
        style={{
          display:"none"
        }}
      />


      <br />


      <button onClick={captureImage}>
        認証
      </button>


    </div>
  );
}

export default Camera;