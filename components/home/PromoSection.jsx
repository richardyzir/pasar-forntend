const promos = [
  {
    title: "Flash Sale",
    desc: "Diskon 50%",
    image: "/promos/flashsale.png",
    bg: "#fef2f2",
    color: "#dc2626",
  },
  {
    title: "Gratis Ongkir",
    desc: "Min. 50rb",
    image: "/promos/ongkir.png",
    bg: "#ecfdf5",
    color: "#059669",
  },
  {
    title: "Promo Spesial",
    desc: "Banyak diskon menanti",
    image: "/promos/ongkir.png",
    bg: "#fafdec",
    color: "#059669",
  },
];

export default function PromoSection() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 12,
        marginBottom: 32,
      }}>
      {promos.map((promo, i) => (
        <div
          key={i}
          className="promo-grid"
          style={{
            background: promo.bg,
            borderRadius: 12,
            padding: "16px",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.02)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          <span style={{ fontSize: "1.5rem" }}>{promo.emoji}</span>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: promo.color,
              margin: "6px 0 2px",
            }}>
            {promo.title}
          </h3>
          <p style={{ fontSize: "0.75rem", color: "#71717a" }}>{promo.desc}</p>
        </div>
      ))}
    </div>
  );
}
