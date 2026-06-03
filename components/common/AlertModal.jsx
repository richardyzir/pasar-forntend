export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Hapus",
  cancelText = "Batal",
}) {
  if (!isOpen) return null;

  const colors = {
    warning: { bg: "#fef3c7", icon: "⚠️", color: "#d97706" },
    error: { bg: "#fee2e2", icon: "❌", color: "#dc2626" },
    success: { bg: "#d1fae5", icon: "✅", color: "#059669" },
  };

  const c = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(2px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
          maxWidth: 340,
          width: "85%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: c.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            fontSize: "1.5rem",
          }}>
          {c.icon}
        </div>

        {title && (
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#18181b",
              marginBottom: 6,
            }}>
            {title}
          </h3>
        )}
        <p style={{ fontSize: "0.875rem", color: "#52525b", marginBottom: 20 }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          {onConfirm ? (
            <>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                {confirmText}
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid #e4e4e7",
                  background: "transparent",
                  color: "#18181b",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                {cancelText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background: "#0f172a",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}>
              Oke, Mengerti
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
