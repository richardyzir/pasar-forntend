import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/format";
import AdminLayout from "../../components/layout/AdminLayout";

// const user =
//   typeof window !== "undefined"
//     ? JSON.parse(localStorage.getItem("user") || "{}")
//     : {};
// const isMaster = user.role === "master";
// const perms = user.permissions || {};

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

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [kurirList, setKurirList] = useState([]);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedKurir, setSelectedKurir] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const isMaster = u.role === "master";
    const perms = {};
    if (u.permissions && Array.isArray(u.permissions)) {
      u.permissions.forEach((p) => {
        perms[p.module] = { view: p.can_view, edit: p.can_edit };
      });
    }
    setCanEdit(isMaster || perms.orders?.edit);
    loadOrders();
    loadKurir(); // ← TAMBAH
  }, []);

  const loadOrders = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { per_page: 20, page: pageNum };
      if (filter) params.status = filter;
      const { data } = await api.get("/admin/orders", { params });
      setOrders(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (e) {}
    setLoading(false);
  };

  const loadKurir = async () => {
    const { data } = await api.get("/admin/kurir");
    setKurirList(data || []);
  };

  const updateStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    loadOrders();
  };

  const assignKurir = async () => {
    if (!selectedKurir) return;
    await api.post(`/admin/orders/${assignModal}/assign`, {
      kurir_id: selectedKurir,
    });
    setAssignModal(null);
    setSelectedKurir("");
    loadOrders();
  };

  return (
    <AdminLayout title="Pesanan">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📦 Pesanan</h1>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Filter */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 8,
        }}>
        {[
          "",
          "pending_payment",
          "paid",
          "processing",
          "shipping",
          "delivered",
          "cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              loadOrders(1);
            }}
            className={`btn btn-sm ${filter === s ? "btn-dark" : "btn-outline"}`}
            style={{ whiteSpace: "nowrap", fontSize: "0.7rem" }}>
            {s ? STATUS_MAP[s] : "Semua"}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <p style={{ textAlign: "center", padding: 40 }}>Memuat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 8,
                }}>
                <div>
                  <p style={{ fontWeight: 700 }}>#{order.order_number}</p>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                    }}>
                    {order.user?.name} • {formatDate(order.created_at)}
                  </p>
                </div>
                <span className={`badge ${STATUS_COLOR[order.status]}`}>
                  {STATUS_MAP[order.status]}
                </span>
              </div>

              {/* Items */}
              <div style={{ fontSize: "0.8rem", marginBottom: 8 }}>
                {order.items?.map((item) => (
                  <span key={item.id} style={{ marginRight: 8 }}>
                    {item.product?.name} x{item.quantity}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}>
                <p style={{ fontWeight: 700 }}>
                  {formatCurrency(order.total_amount)}
                </p>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {canEdit && (
                    <>
                      {order.status === "pending_payment" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(order.id, "processing")}>
                          ✅ Proses
                        </button>
                      )}
                      {order.status === "processing" && (
                        <button
                          className="btn btn-accent btn-sm"
                          onClick={() => setAssignModal(order.id)}>
                          🚚 Assign Kurir
                        </button>
                      )}
                      {order.status === "shipping" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(order.id, "delivered")}>
                          ✅ Selesai
                        </button>
                      )}
                      {order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => updateStatus(order.id, "cancelled")}>
                            ❌ Batal
                          </button>
                        )}
                    </>
                  )}
                </div>
              </div>

              {order.kurir && (
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-secondary)",
                    marginTop: 4,
                  }}>
                  Kurir: {order.kurir.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {lastPage > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginTop: 20,
            paddingBottom: 20,
          }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => loadOrders(page - 1)}
            disabled={page === 1}>
            ←
          </button>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {page} / {lastPage}
          </span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => loadOrders(page + 1)}
            disabled={page === lastPage}>
            →
          </button>
        </div>
      )}
      {/* Assign Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Pilih Kurir</h3>
            <select
              className="form-input"
              value={selectedKurir}
              onChange={(e) => setSelectedKurir(e.target.value)}
              style={{ marginBottom: 12 }}>
              <option value="">-- Pilih Kurir --</option>
              {kurirList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            <button
              className="btn btn-dark btn-block"
              onClick={assignKurir}
              disabled={!selectedKurir}>
              Assign
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
