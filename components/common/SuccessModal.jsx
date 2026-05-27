import { useEffect } from "react";

export default function SuccessModal({ isOpen, onClose, orderNumber, amount }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "2.5rem 2rem",
          textAlign: "center",
          maxWidth: 360,
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          animation: "slideUp 0.3s ease",
        }}>
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#ecfdf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
            fontSize: "2rem",
          }}>
          ✅
        </div>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#18181b",
            marginBottom: 4,
          }}>
          Pesanan Berhasil Dibuat!!
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#71717a", marginBottom: 8 }}>
          Terima kasih telah berbelanja
        </p>

        {orderNumber && (
          <p
            style={{
              fontSize: "0.813rem",
              color: "#0f172a",
              fontWeight: 600,
              background: "#f4f4f5",
              padding: "8px 16px",
              borderRadius: 8,
              display: "inline-block",
              marginBottom: 8,
            }}>
            #{orderNumber}
          </p>
        )}

        {amount && (
          <p
            style={{ fontSize: "1.125rem", fontWeight: 700, color: "#059669" }}>
            Rp {Number(amount).toLocaleString("id-ID")}
          </p>
        )}

        <p style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: 16 }}>
          Silakan lanjutkan ke pembayaran
        </p>
      </div>
    </div>
  );
}
