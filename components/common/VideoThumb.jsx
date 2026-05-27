import { useEffect, useRef, useState } from "react";

export default function VideoThumb({ src, style }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [thumb, setThumb] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      video.currentTime = 1; // ambil frame detik ke-1
    };

    const handleSeeked = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL("image/jpeg"));
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("seeked", handleSeeked);

    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [src]);

  if (thumb) {
    return <img src={thumb} alt="" style={style} />;
  }

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div
        style={{
          ...style,
          background: "var(--bg-card-alt)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <span>🎬</span>
      </div>
    </>
  );
}
