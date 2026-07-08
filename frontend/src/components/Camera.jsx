import { useEffect, useRef } from "react";

function Camera() {
  const videoRef = useRef(null);

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

  return (
    <div>
      <h2>顔登録</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="640"
        height="480"
      />
    </div>
  );
}

export default Camera;