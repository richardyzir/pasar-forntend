import { useState, useRef, useEffect } from "react";

export default function SearchSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Cari...",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = options.find((opt) => opt === value);

  return (
    <div className="form-group" ref={ref}>
      {label && <label className="form-label">{label}</label>}

      <div style={{ position: "relative" }}>
        <div
          className="form-input"
          onClick={() => setOpen(!open)}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <span
            style={{ color: selected ? "var(--text)" : "var(--text-muted)" }}>
            {selected || placeholder}
          </span>
          <span style={{ fontSize: "0.7rem" }}>{open ? "▲" : "▼"}</span>
        </div>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              marginTop: 4,
              zIndex: 100,
              maxHeight: 200,
              overflow: "hidden",
              boxShadow: "var(--shadow-md)",
            }}>
            <input
              type="text"
              className="form-input"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                borderBottom: "1px solid var(--border)",
                borderRadius: 0,
              }}
              autoFocus
            />
            <div style={{ overflowY: "auto", maxHeight: 150 }}>
              {filtered.length === 0 ? (
                <p
                  style={{
                    padding: "10px 12px",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                  }}>
                  Tidak ditemukan
                </p>
              ) : (
                filtered.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setSearch("");
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      background:
                        value === opt ? "var(--primary-light)" : "transparent",
                      color: value === opt ? "var(--primary)" : "var(--text)",
                      fontWeight: value === opt ? 600 : 400,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        value === opt ? "var(--primary-light)" : "transparent")
                    }>
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
