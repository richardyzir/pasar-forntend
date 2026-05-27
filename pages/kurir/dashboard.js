import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/format";

const STATUS_MAP = {
  shipping: "Dikirim",
  delivered: "Terkirim",
};

export default function KurirDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (!u.role || u.role !== "kurir") {
      router.push("/admin/login");
      return;
    }
    setUser(u);
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders", {
        params: { status: "shipping", per_page: 50 },
      });
      const myOrders = (data.data || []).filter((o) => o.kurir_id === user?.id);
      setOrders(myOrders);
    } catch (e) {}
    setLoading(false);
  };

  const markDelivered = async (orderId) => {
    await api.put(`/admin/orders/${orderId}/status`, { status: "delivered" });
    loadOrders();
  };

  return (
    <AdminLayout title="Kurir">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          🚚 Dashboard Kurir
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Selamat datang, {user?.name}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div className="card p-4" style={{ flex: 1, textAlign: "center" }}>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b" }}>
            {orders.length}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Menunggu Antar
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: 40 }}>Memuat...</p>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "var(--text-secondary)",
          }}>
          <span
            style={{ fontSize: "3rem", display: "block", marginBottom: 10 }}>
            📦
          </span>
          <p>Tidak ada pesanan yang perlu diantar</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                <div>
                  <p style={{ fontWeight: 700 }}>#{order.order_number}</p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                    }}>
                    {order.user?.name} • {formatDate(order.created_at)}
                  </p>
                </div>
                <span className="badge badge-warning">
                  🚚 {STATUS_MAP[order.status]}
                </span>
              </div>

              <div style={{ fontSize: "0.8rem", marginBottom: 8 }}>
                {order.items?.map((item) => (
                  <span key={item.id} style={{ marginRight: 8 }}>
                    {item.product?.name} x{item.quantity}
                  </span>
                ))}
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                }}>
                <p>📍 {order.shipping_address}</p>
                <p>
                  🕐{" "}
                  {order.delivery_time === "pagi"
                    ? "08:30 - 10:30"
                    : order.delivery_time === "sore"
                      ? "16:00 - 17:30"
                      : order.delivery_time === "khusus"
                        ? `Khusus: ${order.delivery_note || "-"}`
                        : "-"}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <p style={{ fontWeight: 700 }}>
                  {formatCurrency(order.total_amount)}
                </p>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => markDelivered(order.id)}>
                  ✅ Selesai Antar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
