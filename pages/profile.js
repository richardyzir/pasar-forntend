import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { showToast } from "../components/common/Toast";

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { loading, put } = useApi();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    try {
      await put("/profile", form);
      showToast("Profil berhasil diperbarui");
      setEditMode(false);
    } catch (e) {}
  };

  return (
    <Layout>
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <h1>{user?.name}</h1>
          <p>{user?.role === "user" ? "Pelanggan" : user?.role}</p>
        </div>

        {/* Info Cards */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h3>Informasi Pribadi</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setEditMode(!editMode)}>
              {editMode ? "Batal" : "✏️ Edit"}
            </button>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-label">Nama</span>
              {editMode ? (
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              ) : (
                <span className="profile-value">{user?.name}</span>
              )}
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user?.email}</span>
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Nomor HP</span>
              {editMode ? (
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              ) : (
                <span className="profile-value">{user?.phone}</span>
              )}
            </div>

            <div className="profile-info-row">
              <span className="profile-label">Alamat</span>
              {editMode ? (
                <textarea
                  className="form-textarea"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              ) : (
                <span className="profile-value">{user?.address || "-"}</span>
              )}
            </div>
          </div>

          {editMode && (
            <button
              className="btn btn-dark btn-block"
              onClick={handleSave}
              disabled={loading}
              style={{ marginTop: 16 }}>
              {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          )}
        </div>

        {/* Points */}
        <div className="profile-card" style={{ marginTop: 12 }}>
          <h3>💰 Poin Saya</h3>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}>
            {user?.points || 0}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Poin dapat ditukar dengan diskon
          </p>
        </div>

        {/* Logout */}
        <button
          className="btn btn-danger btn-block"
          onClick={logout}
          style={{ marginTop: 12 }}>
          🚪 Keluar
        </button>
      </div>
    </Layout>
  );
}
