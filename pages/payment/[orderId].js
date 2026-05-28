import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import { useApi } from "../../hooks/useApi";
import { formatCurrency } from "../../utils/format";

const STATUS_MAP = {
  pending_payment: "Menunggu Bayar",
  paid: "Dibayar",
  processing: "Diproses",
  shipping: "Dikirim",
  delivered: "Terkirim",
  cancelled: "Dibatalkan",
  expired: "Kadaluarsa",
};

const STATUS_ICON = {
  pending_payment: "⏳",
  paid: "✅",
  processing: "🔄",
  shipping: "🚚",
  delivered: "📦",
  cancelled: "❌",
  expired: "⏰",
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function PaymentPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { loading, get } = useApi();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await get(`/orders/${orderId}`);
      setOrder(data);
      if (data.payment?.expires_at) {
        const expiresAt = new Date(data.payment.expires_at).getTime();
        const seconds = Math.max(
          0,
          Math.floor((expiresAt - Date.now()) / 1000),
        );
        setTimeLeft(seconds);
        if (seconds <= 0) setIsExpired(true);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      if (order) setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, order]);

  if (loading || !order)
    return (
      <Layout>
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      </Layout>
    );

  const isCod = order.payment_method === "cod";

  return (
    <Layout>
      <div className="payment-container">
        <h1 className="payment-title">Detail Pesanan</h1>

        {order.status === "pending_payment" && (
          <div
            style={{
              background: isCod
                ? "#dbeafe"
                : isExpired
                  ? "#fee2e2"
                  : timeLeft < 120
                    ? "#fef3c7"
                    : "#d1fae5",
              borderRadius: 12,
              padding: "14px 16px",
              textAlign: "center",
              marginBottom: 16,
            }}>
            {isCod ? (
              <>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#2563eb",
                  }}>
                  💵 Pembayaran di Tempat
                </p>
                <p style={{ fontSize: "0.75rem", color: "#1e40af" }}>
                  Kurir akan datang sesuai waktu pengantaran. Siapkan uang tunai
                  ya!
                </p>
              </>
            ) : isExpired ? (
              <>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#dc2626",
                  }}>
                  ⏰ Waktu Pembayaran Habis
                </p>
                <p style={{ fontSize: "0.75rem", color: "#991b1b" }}>
                  Silakan buat pesanan baru
                </p>
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#71717a",
                    marginBottom: 4,
                  }}>
                  Selesaikan pembayaran dalam
                </p>
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: timeLeft < 120 ? "#d97706" : "#059669",
                    fontFamily: "monospace",
                  }}>
                  {formatTime(timeLeft)}
                </p>
              </>
            )}
          </div>
        )}

        <div className="payment-card">
          <div className="payment-row">
            <span className="payment-label">Nomor Pesanan</span>
            <span className="payment-value-bold">#{order.order_number}</span>
          </div>
          <div className="payment-row">
            <span className="payment-label">Status</span>
            <span
              className={`badge ${order.status === "pending_payment" ? "badge-warning" : order.status === "delivered" ? "badge-success" : "badge-primary"}`}>
              {STATUS_ICON[order.status]} {STATUS_MAP[order.status]}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 12px",
              marginTop: 8,
              marginBottom: 8,
              background: "var(--primary-light)",
              borderRadius: 8,
            }}>
            <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>
              Metode Bayar
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--primary)",
              }}>
              {isCod && "💵 Bayar di Tempat"}
              {order.payment_method === "bank_transfer" && "🏦 Transfer Bank"}
              {order.payment_method === "virtual_account" &&
                "📱 Virtual Account"}
              {order.payment_method === "qris" && "📷 QRIS"}
            </span>
          </div>

          {order.status === "pending_payment" &&
            order.payment_method !== "cod" &&
            order.payment_method !== "qris" && (
              <div
                className="payment-card"
                style={{
                  marginTop: 8,
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  padding: 12,
                }}>
                <p className="payment-section-title">Informasi Pembayaran</p>
                {order.payment_method === "bank_transfer" && (
                  <>
                    <div className="payment-row">
                      <span className="payment-label">Bank</span>
                      <span className="payment-value-bold">BCA</span>
                    </div>
                    <div className="payment-row">
                      <span className="payment-label">No. Rekening</span>
                      <span
                        className="payment-value-bold"
                        style={{ letterSpacing: 1 }}>
                        1234567890
                      </span>
                    </div>
                    <div className="payment-row">
                      <span className="payment-label">Atas Nama</span>
                      <span className="payment-value-bold">Fofi Mart</span>
                    </div>
                  </>
                )}
                {order.payment_method === "virtual_account" && (
                  <div className="payment-row">
                    <span className="payment-label">No. VA</span>
                    <span
                      className="payment-value-bold"
                      style={{ letterSpacing: 1, fontSize: "1rem" }}>
                      823{String(order.id).padStart(7, "0")}
                    </span>
                  </div>
                )}
              </div>
            )}

          {isCod && (
            <div
              style={{
                textAlign: "center",
                padding: "12px 0",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}>
              💵 Silahkan melakukan pembayaran saat kurir tiba
            </div>
          )}

          <div className="payment-row">
            <span className="payment-label">Waktu Antar</span>
            <span className="payment-value">
              {order.delivery_time === "pagi" && "🌅 08:30 - 10:30"}
              {order.delivery_time === "sore" && "🌆 16:00 - 17:30"}
              {order.delivery_time === "khusus" && "📅 Pesanan Khusus"}
            </span>
          </div>
          {order.delivery_time === "khusus" && order.delivery_note && (
            <div className="payment-row">
              <span className="payment-label">Catatan Waktu</span>
              <span className="payment-value">{order.delivery_note}</span>
            </div>
          )}
          <div className="payment-divider" />
          <p className="payment-section-title">Items</p>
          {order.items?.map((item) => (
            <div key={item.id} className="payment-item-row">
              <span>
                {item.product?.name || "Produk"} x{item.quantity}
              </span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <div className="payment-divider" />
          <div className="payment-row">
            <span className="payment-label">Total</span>
            <span className="payment-total">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
          {order.notes && (
            <>
              <div className="payment-divider" />
              <div className="payment-row">
                <span className="payment-label">Catatan</span>
                <span className="payment-value">{order.notes}</span>
              </div>
            </>
          )}
        </div>

        <button
          className="btn btn-dark btn-block"
          style={{ marginTop: 10 }}
          onClick={() => router.push("/orders")}>
          ← Kembali ke Pesanan
        </button>
      </div>
    </Layout>
  );
}
