import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";

export default function BannerSlider() {
  const { get } = useApi();
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await get("/banners");
      setBanners(data || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: 55,
        marginBottom: 15,
        width: "100%",
        aspectRatio: "2/1",
        maxHeight: 500,
        borderRadius: 6,
      }}>
      <div
        style={{
          display: "flex",
          transition: "transform 0.5s ease",
          transform: `translateX(-${current * 100}%)`,
          height: "100%",
        }}>
        {banners.map((banner, i) => (
          <div key={i} style={{ minWidth: "100%", height: "100%" }}>
            {banner.image?.match(/\.(mp4|webm)$/) ? (
              <video
                src={`https://api.fofimart.com${banner.image}`}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img
                src={`https://api.fofimart.com${banner.image}`}
                alt={banner.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 0,
            right: 0,
            textAlign: "center",
          }}>
          {banners.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                display: "inline-block",
                width: i === current ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? "#fff" : "rgba(255,255,255,0.5)",
                margin: "0 2px",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
