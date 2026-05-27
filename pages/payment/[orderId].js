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
  const [paymentSettings, setPaymentSettings] = useState([]);

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      const data = await get("/payment-settings");
      setPaymentSettings(data || []);
    } catch (e) {}
  };

  const getPaymentInfo = (method) => {
    return paymentSettings.find((p) => p.method === method);
  };

  const loadOrder = async () => {
    try {
      const data = await get(`/orders/${orderId}`);
      setOrder(data);

      if (data.payment?.expires_at) {
        const expiresAt = new Date(data.payment.expires_at).getTime();
        const now = Date.now();
        const seconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(seconds);
        if (seconds <= 0) setIsExpired(true);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId]);

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

  if (loading || !order) {
    return (
      <Layout>
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="payment-container">
        <h1 className="payment-title">Detail Pesanan</h1>

        {order.status === "pending_payment" && (
          <div
            style={{
              background: isExpired
                ? "#fee2e2"
                : timeLeft < 120
                  ? "#fef3c7"
                  : "#d1fae5",
              borderRadius: 12,
              padding: "14px 16px",
              textAlign: "center",
              marginBottom: 16,
            }}>
            {isExpired ? (
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
            <span className="payment-label">Nomor Pesanan&nbsp;</span>
            <span className="payment-value-bold">#{order.order_number}</span>
          </div>

          <div className="payment-row">
            <span className="payment-label">Status</span>
            <span
              className={`badge ${order.status === "pending_payment" ? "badge-warning" : order.status === "delivered" ? "badge-success" : "badge-primary"}`}>
              {STATUS_ICON[order.status]} {STATUS_MAP[order.status]}
            </span>
          </div>

          {/* Metode Bayar */}
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
              // border: "1px solid var(--primary)",
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
              {order.payment_method === "cod" && "💵 Bayar di Tempat"}
              {order.payment_method === "bank_transfer" && "🏦 Transfer Bank"}
              {order.payment_method === "virtual_account" &&
                "📱 Virtual Account"}
              {order.payment_method === "qris" && "📷 QRIS"}
            </span>
          </div>

          {/* Info Rekening / VA - hanya jika bukan COD & bukan QRIS */}
          {order.status === "pending_payment" &&
            order.payment_method !== "cod" &&
            order.payment_method !== "qris" && (
              <div
                className="payment-card"
                style={{
                  marginTop: 1,
                  borderRadius: 6,
                  border: "1px solid var(--primary)",
                }}>
                <p className="payment-section-title">Informasi Pembayaran</p>

                {order.payment_method === "bank_transfer" && (
                  <>
                    <div className="payment-row">
                      <span className="payment-label">Bank</span>
                      <span className="payment-value-bold">
                        {getPaymentInfo("bank_transfer")?.bank_name || "BCA"}
                      </span>
                    </div>
                    <div className="payment-row">
                      <span className="payment-label">No. Rekening</span>
                      <span
                        className="payment-value-bold"
                        style={{ letterSpacing: 1 }}>
                        {getPaymentInfo("bank_transfer")?.account_number ||
                          "1234567890"}
                      </span>
                    </div>
                    <div className="payment-row">
                      <span className="payment-label">Atas Nama</span>
                      <span className="payment-value-bold">
                        {getPaymentInfo("bank_transfer")?.account_name ||
                          "Fofi Mart"}
                      </span>
                    </div>
                  </>
                )}

                {order.payment_method === "virtual_account" && (
                  <div className="payment-row">
                    <span className="payment-label">No. VA</span>
                    <span
                      className="payment-value-bold"
                      style={{ letterSpacing: 1, fontSize: "1rem" }}>
                      {getPaymentInfo("virtual_account")?.va_prefix || "823"}
                      {String(order.id).padStart(7, "0")}
                    </span>
                  </div>
                )}
              </div>
            )}

          {/* QRIS */}
          {order.status === "pending_payment" &&
            order.payment_method === "qris" && (
              <div
                className="payment-card"
                style={{ marginTop: 8, textAlign: "center" }}>
                <p className="payment-section-title">Scan QRIS</p>
                <div
                  style={{
                    width: 140,
                    height: 140,
                    margin: "12px auto 8px",
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <span style={{ fontSize: "3rem" }}>📱</span>
                </div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-secondary)",
                  }}>
                  Scan dengan e-wallet / mobile banking
                </p>
              </div>
            )}

          {/* COD */}
          {order.payment_method === "cod" && (
            <div
              className="payment-card"
              style={{ marginTop: 8, textAlign: "center" }}>
              {/* <p className="payment-section-title">💵 Bayar di Tempat</p> */}
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  padding: "8px 0",
                }}>
                Silahkan melakukan pembayaran saat kurir tiba
              </p>
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
