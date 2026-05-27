import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, formatDate } from "../utils/format";

const STATUS_MAP = {
  pending_payment: "Menunggu Bayar",
  paid: "Dibayar",
  processing: "Diproses",
  shipping: "Dikirim",
  delivered: "Terkirim",
  cancelled: "Dibatalkan",
  expired: "Kadaluarsa",
};

const STATUS_COLOR = {
  pending_payment: "badge-warning",
  paid: "badge-primary",
  processing: "badge-primary",
  shipping: "badge-warning",
  delivered: "badge-success",
  cancelled: "badge-danger",
  expired: "badge-gray",
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

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { loading, get } = useApi();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = {};
        let changed = false;
        Object.keys(prev).forEach((id) => {
          if (prev[id] > 0) {
            updated[id] = prev[id] - 1;
            changed = true;
          } else {
            updated[id] = 0;
          }
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/orders");
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async (page = 1) => {
    try {
      const data = await get("/orders", { page });
      setOrders(data?.data || []);
      setCurrentPage(data?.current_page || 1);
      setLastPage(data?.last_page || 1);

      // Hitung timer
      const newTimers = {};
      data?.data?.forEach((order) => {
        if (order.status === "pending_payment" && order.payment?.expires_at) {
          const expiresAt = new Date(order.payment.expires_at).getTime();
          newTimers[order.id] = Math.max(
            0,
            Math.floor((expiresAt - Date.now()) / 1000),
          );
        }
      });
      setTimers(newTimers);
    } catch (e) {}
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginTop: 50,
          marginBottom: 24,
          color: "var(--text)",
        }}>
        Pesanan Saya
      </h1>

      {loading ? (
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <span
            style={{ fontSize: "4rem", display: "block", marginBottom: 16 }}>
            📦
          </span>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 8,
            }}>
            Belum Ada Pesanan
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Yuk mulai belanja!
          </p>
          <button
            className="btn btn-dark btn-lg"
            onClick={() => router.push("/")}>
            Mulai Belanja
          </button>
        </div>
      ) : (
        <>
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                {/* Header */}
                <div className="order-card-header">
                  <div>
                    <p className="order-number">#{order.order_number}</p>
                    <p className="order-date">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`badge ${STATUS_COLOR[order.status]}`}>
                    {STATUS_ICON[order.status]} {STATUS_MAP[order.status]}
                  </span>
                </div>

                {order.status === "pending_payment" &&
                  timers[order.id] !== undefined && (
                    <div
                      style={{
                        margin: "0 16px 8px",
                        padding: "8px 12px",
                        borderRadius: 8,
                        background:
                          timers[order.id] <= 0
                            ? "#fee2e2"
                            : timers[order.id] < 120
                              ? "#fef3c7"
                              : "#d1fae5",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.75rem",
                      }}>
                      <span>⏱</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            timers[order.id] <= 0
                              ? "#dc2626"
                              : timers[order.id] < 120
                                ? "#d97706"
                                : "#059669",
                        }}>
                        {timers[order.id] <= 0
                          ? "Kadaluarsa"
                          : formatTime(timers[order.id])}
                      </span>
                    </div>
                  )}

                {/* Items */}
                <div className="order-card-items">
                  {order.items?.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <span>
                        {item.product?.name || "Produk"} x{item.quantity}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="order-card-footer">
                  <div>
                    <p className="order-payment-method">
                      {order.payment_method === "cod"
                        ? "COD"
                        : order.payment_method === "bank_transfer"
                          ? "Transfer Bank"
                          : order.payment_method === "virtual_account"
                            ? "Virtual Account"
                            : "QRIS"}
                    </p>
                    <p className="order-total">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => router.push(`/payment/${order.id}`)}>
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="orders-pagination">
              <button
                onClick={() => loadOrders(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-outline btn-sm">
                ←
              </button>
              <span>
                {currentPage} / {lastPage}
              </span>
              <button
                onClick={() => loadOrders(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="btn btn-outline btn-sm">
                →
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
