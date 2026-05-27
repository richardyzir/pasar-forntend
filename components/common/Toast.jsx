import { useState, useEffect, useCallback } from "react";

let showToastFn = null;

export function showToast(message) {
  if (showToastFn) showToastFn(message);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFn = (message) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    };
    return () => {
      showToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: "#18181b",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 12,
            fontSize: "0.875rem",
            fontWeight: 500,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            animation: "slideUp 0.3s ease",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
          ✅ {toast.message}
        </div>
      ))}
    </div>
  );
}
