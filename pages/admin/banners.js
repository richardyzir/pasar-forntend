import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import { showToast } from "../../components/common/Toast";
import Toast from "../../components/common/Toast";
import VideoThumb from "../../components/common/VideoThumb";
import AdminLayout from "../../components/layout/AdminLayout";

export default function AdminBanners() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    bg_color: "#fef3c7",
    text_color: "#d97706",
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const isMaster = u.role === "master";
    const perms = {};
    if (u.permissions && Array.isArray(u.permissions)) {
      u.permissions.forEach((p) => {
        perms[p.module] = {
          view: p.can_view,
          create: p.can_create,
          edit: p.can_edit,
          delete: p.can_delete,
        };
      });
    }
    setCanCreate(isMaster || perms.banners?.create);
    setCanEdit(isMaster || perms.banners?.edit);
    setCanDelete(isMaster || perms.banners?.delete);
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const { data } = await api.get("/admin/banners");
    setBanners(data.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imagePath = form.image || "";

    // Upload gambar dulu kalau ada file baru
    if (imageFile && typeof imageFile !== "string") {
      const fd = new FormData();
      fd.append("image", imageFile);
      const { data } = await api.post(`/admin/banners/upload-temp`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      imagePath = data.image;
    }

    const payload = { ...form, image: imagePath };

    if (editId) {
      await api.put(`/admin/banners/${editId}`, payload);
      showToast("✅ Banner diperbarui");
    } else {
      await api.post("/admin/banners", payload);
      showToast("✅ Banner ditambahkan");
    }

    setShowForm(false);
    setEditId(null);
    setImageFile(null);
    setForm({
      title: "",
      subtitle: "",
      image: "",
      bg_color: "#fef3c7",
      text_color: "#d97706",
      is_active: true,
      order: 0,
    });
    loadBanners();
  };

  const handleEdit = (b) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      image: b.image || "", // ← PASTIKAN INI ADA
      bg_color: b.bg_color,
      text_color: b.text_color,
      is_active: b.is_active,
      order: b.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin hapus?")) {
      await api.delete(`/admin/banners/${id}`);
      showToast("🗑 Banner dihapus");
      loadBanners();
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    const fd = new FormData();
    fd.append("image", imageFile);
    try {
      await api.post(`/admin/banners/${uploadId}/image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("✅ Gambar diupload");
      setUploadId(null);
      setImageFile(null);
      loadBanners();
    } catch (err) {
      showToast(
        "❌ " + (err.response?.data?.errors?.image?.[0] || "Upload gagal"),
      );
    }
  };

  return (
    <AdminLayout title="Banner">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>🎨 Banner</h1>
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
        {canCreate && (
          <button
            className="btn btn-dark btn-sm"
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}>
            + Tambah
          </button>
        )}
      </div>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {banners.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                padding: 14,
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}>
              {b.image?.match(/\.(mp4|webm)$/) ? (
                <video
                  src={`https://api.fofimart.com${b.image}`}
                  muted
                  preload="metadata"
                  style={{
                    width: 80,
                    height: 60,
                    borderRadius: 8,
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => setUploadId(b.id)}
                />
              ) : (
                <img
                  src={`https://api.fofimart.com${b.image}`}
                  alt=""
                  style={{
                    width: 80,
                    height: 60,
                    borderRadius: 8,
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => setUploadId(b.id)}
                />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>{b.title}</p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}>
                  {b.subtitle}
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: b.bg_color,
                      border: "1px solid #ddd",
                    }}
                  />
                  <span style={{ fontSize: "0.7rem" }}>
                    {b.is_active ? "✅ Aktif" : "❌ Nonaktif"}
                  </span>
                  <span style={{ fontSize: "0.7rem" }}>Urutan: {b.order}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {canEdit && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleEdit(b)}>
                    ✏️
                  </button>
                )}
                {canDelete && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(b.id)}>
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 20, maxHeight: "90vh", overflow: "auto" }}>
            <h3 style={{ marginBottom: 16 }}>
              {editId ? "Edit" : "Tambah"} Banner
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Upload Gambar */}
              <div className="form-group">
                <label className="form-label">Gambar Banner</label>
                {imageFile ? (
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    {imageFile.type?.startsWith("video/") ? (
                      <video
                        src={URL.createObjectURL(imageFile)}
                        controls
                        muted
                        style={{
                          width: "100%",
                          height: 120,
                          borderRadius: 10,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
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
                    )}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: 6 }}
                      onClick={() => {
                        setImageFile(null);
                        setForm({ ...form, image: "" });
                      }}>
                      ✕ Hapus
                    </button>
                  </div>
                ) : form.image?.match(/\.(mp4|webm)$/) ? (
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <video
                      src={`https://api.fofimart.com${form.image}`}
                      controls
                      muted
                      style={{
                        width: "100%",
                        height: 120,
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : form.image ? (
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
                  <div
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: 10,
                      padding: 20,
                      textAlign: "center",
                      cursor: "pointer",
                      marginBottom: 8,
                    }}>
                    <p>📷 Klik untuk upload gambar/video</p>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                      }}>
                      JPG, PNG, WebP, MP4, WebM (max 20MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      // Preview & simpan ke form
                      setForm({ ...form, image: URL.createObjectURL(file) });
                    }
                  }}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Judul</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sub Judul</label>
                <input
                  className="form-input"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">BG Color</label>
                  <input
                    className="form-input"
                    type="color"
                    value={form.bg_color}
                    onChange={(e) =>
                      setForm({ ...form, bg_color: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Text Color</label>
                  <input
                    className="form-input"
                    type="color"
                    value={form.text_color}
                    onChange={(e) =>
                      setForm({ ...form, text_color: e.target.value })
                    }
                  />
                </div>
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

              <label
                className="form-checkbox"
                style={{
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                <span>Aktif</span>
              </label>

              <button className="btn btn-dark btn-block" type="submit">
                {editId ? "Simpan Perubahan" : "Tambah Banner"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadId && (
        <div
          className="modal-overlay"
          onClick={() => {
            setUploadId(null);
            setImageFile(null);
          }}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Upload Gambar/Video Banner</h3>

            {/* Preview */}
            {imageFile && imageFile.type?.startsWith("video/") && (
              <video
                src={URL.createObjectURL(imageFile)}
                muted
                preload="metadata"
                style={{
                  width: "100%",
                  height: 120,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            )}

            <input
              type="file"
              accept="image/*,video/mp4,video/webm"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ marginBottom: 12, width: "100%" }}
            />
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginBottom: 12,
              }}>
              JPG, PNG, WebP, MP4, WebM (max 20MB)
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setUploadId(null);
                  setImageFile(null);
                }}>
                Batal
              </button>
              <button
                className="btn btn-dark btn-sm"
                style={{ flex: 1 }}
                disabled={!imageFile}
                onClick={handleUpload}>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast />
    </AdminLayout>
  );
}
