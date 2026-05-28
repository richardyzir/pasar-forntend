import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data || []));
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <h3
        style={{
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 10,
        }}>
        📂 Kategori
      </h3>
      <div
        className="category-scroll"
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 4,
        }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => router.push(`/category/${cat.name}`)}
            style={{
              background: cat.color || "var(--bg-card-alt)",
              borderRadius: 6,
              padding: "12px 14px",
              textAlign: "center",
              cursor: "pointer",
              flexShrink: 0,
              minWidth: 72,
            }}>
            <span
              style={{ fontSize: "1.5rem", display: "block", marginBottom: 4 }}>
              {cat.emoji || "📂"}
            </span>
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
  );
}
