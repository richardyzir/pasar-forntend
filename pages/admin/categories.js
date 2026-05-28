import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../utils/api";
import { showToast } from "../../components/common/Toast";
import Toast from "../../components/common/Toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    emoji: "",
    color: "#f4f4f5",
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const { data } = await api.get("/admin/categories");
    setCategories(data.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      const { data: img } = await api.post(
        "/admin/categories/upload-image",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      form.image = img.image;
    }
    if (editId) {
      await api.put(`/admin/categories/${editId}`, form);
      showToast("✅ Kategori diperbarui");
    } else {
      await api.post("/admin/categories", form);
      showToast("✅ Kategori ditambahkan");
    }
    setShowForm(false);
    setEditId(null);
    setForm({
      name: "",
      emoji: "",
      color: "#f4f4f5",
      order: 0,
      is_active: true,
    });
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin hapus?")) {
      await api.delete(`/admin/categories/${id}`);
      showToast("🗑 Kategori dihapus");
      loadCategories();
    }
  };

  return (
    <AdminLayout title="Kategori">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📂 Kategori</h1>
        <button
          className="btn btn-dark btn-sm"
          onClick={() => {
            setEditId(null);
            setShowForm(true);
          }}>
          + Tambah
        </button>
      </div>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="card"
              style={{
                padding: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
              <span style={{ fontSize: "1.5rem" }}>{cat.emoji || "📂"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>{cat.name}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: cat.color,
                    }}
                  />
                  <span style={{ fontSize: "0.7rem" }}>
                    {cat.is_active ? "✅" : "❌"} Urutan: {cat.order}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setEditId(cat.id);
                  setForm(cat);
                  setShowForm(true);
                }}>
                ✏️
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(cat.id)}>
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 20 }}>
            <h3>{editId ? "Edit" : "Tambah"} Kategori</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Gambar</label>
                {imageFile ? (
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: 6 }}
                      onClick={() => setImageFile(null)}>
                      ✕ Hapus
                    </button>
                  </div>
                ) : editId && form.image ? (
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <img
                      src={`https://api.fofimart.com${form.image}`}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    style={{ width: "100%" }}
                  />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Nama</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <input
                  className="form-input"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Warna</label>
                <input
                  className="form-input"
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Urutan</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </div>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />{" "}
                Aktif
              </label>
              <button
                className="btn btn-dark btn-block"
                type="submit"
                style={{ marginTop: 12 }}>
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}
      <Toast />
    </AdminLayout>
  );
}
