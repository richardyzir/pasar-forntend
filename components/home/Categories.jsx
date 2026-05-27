import { useRouter } from "next/router";

const categoryRows = [
  {
    items: [
      { name: "Sayur", image: "/categories/Sayur.png", color: "#fef3c7" },
      { name: "Ikan", image: "/categories/ikan.png", color: "#dbeafe" },
      { name: "Makanan", image: "/categories/makanan.png", color: "#e0e7ff" },
      { name: "Minuman", image: "/categories/minuman.png", color: "#fce7f3" },
      { name: "Buah", image: "/categories/buah.png", color: "#d1fae5" },
      // { name: "Beku", image: "/categories/beku.png", color: "#e0f2fe" },
    ],
  },
  {
    items: [
      { name: "Bumbu", image: "/categories/bumbu.png", color: "#fef9c3" },
      { name: "Sembako", image: "/categories/sembako.png", color: "#f3e8ff" },
      {
        name: "Perawatan",
        image: "/categories/perawatan.png",
        color: "#fff7ed",
      },
      {
        name: "Rumah Tangga",
        image: "/categories/rumah.png",
        color: "#fdf2f8",
      },
      // { name: "Susu", image: "/categories/susu.png", color: "#ecfdf5" },
      // { name: "Roti", image: "/categories/roti.png", color: "#fffbeb" },
      // { name: "Roti", image: "/categories/roti.png", color: "#fffbeb" },
    ],
  },
];
export default function Categories() {
  const router = useRouter();

  return (
    <div style={{ marginBottom: 28 }}>
      {categoryRows.map((row, rowIndex) => (
        <div key={rowIndex} style={{ marginBottom: 0 }}>
          <div
            className="category-scroll"
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingBottom: 4,
              WebkitOverflowScrolling: "touch",
            }}>
            {row.items.map((cat, i) => (
              <div
                key={i}
                onClick={() => router.push(`/?category=${cat.name}`)}
                style={{
                  background: cat.color,
                  borderRadius: 12,
                  padding: "12px 14px",
                  textAlign: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  minWidth: 72,
                  transition: "transform 0.2s",
                }}>
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "1.5rem",
                      display: "block",
                      marginBottom: 4,
                    }}>
                    📦
                  </span>
                )}
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    color: "#3f3f46",
                  }}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
