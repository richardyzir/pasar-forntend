import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import AdminLayout from "../../components/layout/AdminLayout";
import { formatCurrency } from "../../utils/format";
import { showToast } from "../../components/common/Toast";
import Toast from "../../components/common/Toast";
import SearchSelect from "../../components/common/SearchSelect";
import PriceInput from "../../components/common/PriceInput";
import AlertModal from "../../components/common/AlertModal";

const CATEGORIES = [
  "Sayur",
  "Ikan",
  "Daging",
  "Buah",
  "Sembako",
  "Bumbu",
  "Minuman",
  "Makanan",
  "Perawatan",
  "Rumah Tangga",
  "Segar",
  "Beku",
  "Susu & Olahan",
];
const UNITS = [
  "pack",
  "kg",
  "gram",
  "liter",
  "ml",
  "pcs",
  "ikat",
  "sisir",
  "buah",
  "bungkus",
  "botol",
  "kaleng",
  "karung",
  "sachet",
  "renteng",
  "dus",
];

export default function AdminPerhitungan() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    base_price: "",
    stock: "",
    category: "",
    unit: "pack",
    discount: "",
    discount_type: "",
    image: "",
    is_active: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setCanCreate(isMaster || perms.perhitungan?.create);
    setCanEdit(isMaster || perms.perhitungan?.edit);
    setCanDelete(isMaster || perms.perhitungan?.delete);
    loadProducts();
  }, [search]);

  const loadProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/perhitungan", {
        params: { search, per_page: 20, page: pageNum },
      });
      setProducts(data?.data || data || []);
      setPage(data?.current_page || 1);
      setLastPage(data?.last_page || 1);
    } catch (e) {}
    setLoading(false);
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      base_price: p.base_price,
      stock: p.stock,
      category: p.category || "",
      unit: p.unit || "pack",
      image: p.image || "",
      profit_percent: p.profit_percent ?? 2,
      ops_percent: p.ops_percent ?? 15,
      discount: p.discount || "",
      discount_type: p.discount_type || "",
      is_active: p.is_active ?? false,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("id", editId);
      const { data: img } = await api.post(
        "/admin/perhitungan/upload-image",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      form.image = img.image;
      setForm({ ...form, image: img.image });
    }
    if (editId) {
      await api.put(`/admin/perhitungan/${editId}`, form);
      showToast("✅ Diperbarui");
    } else {
      await api.post("/admin/perhitungan", form);
      showToast("✅ Ditambahkan");
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", base_price: "", stock: "", category: "" });
    loadProducts();
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await api.delete(`/admin/perhitungan/${deleteId}`);
      showToast("🗑 Dihapus");
      loadProducts();
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout title="Perhitungan">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          🧮 Perhitungan Harga
        </h1>
        {canCreate && (
          <button
            className="btn btn-dark btn-sm"
            onClick={() => {
              setEditId(null);
              setForm({ name: "", base_price: "", stock: "", category: "" });
              setShowForm(true);
            }}>
            + Tambah
          </button>
        )}
      </div>

      <input
        type="text"
        className="form-input"
        placeholder="Cari produk..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          loadProducts(1);
        }}
        style={{ marginBottom: 16 }}
      />

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.8rem",
            }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: 8 }}>Nama</th>
                <th style={{ padding: 8 }}>Kategori</th>
                <th style={{ padding: 8 }}>Satuan</th>
                <th style={{ padding: 8 }}>Stok</th>
                <th style={{ padding: 8 }}>Base</th>
                <th style={{ padding: 8 }}>Profit</th>
                <th style={{ padding: 8 }}>Ops</th>
                <th style={{ padding: 8 }}>Diskon</th>
                <th style={{ padding: 8 }}>Jual</th>
                <th style={{ padding: 8 }}>Show</th>
                <th style={{ padding: 8 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 8 }}>{p.name}</td>
                  <td style={{ padding: 8 }}>{p.category}</td>
                  <td style={{ padding: 8 }}>{p.unit}</td>
                  <td style={{ padding: 8 }}>{p.stock}</td>
                  <td style={{ padding: 8 }}>{formatCurrency(p.base_price)}</td>
                  <td style={{ padding: 8 }}>{formatCurrency(p.profit)}</td>
                  <td style={{ padding: 8 }}>{formatCurrency(p.ops)}</td>
                  <td style={{ padding: 8 }}>
                    {p.discount > 0
                      ? p.discount_type === "percentage"
                        ? `${p.discount}%`
                        : formatCurrency(p.discount)
                      : "-"}
                  </td>
                  <td
                    style={{
                      padding: 8,
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}>
                    {formatCurrency(p.selling_price)}
                  </td>
                  <td style={{ padding: 8 }}>
                    <span
                      className={`badge ${p.is_active ? "badge-success" : "badge-gray"}`}>
                      {p.is_active ? "✓" : "✕"}
                    </span>
                  </td>
                  <td style={{ padding: 8 }}>
                    {canEdit && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleEdit(p)}>
                        ✏️
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteClick(p.id)}>
                        🗑
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lastPage > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 16,
              }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => loadProducts(page - 1)}
                disabled={page === 1}>
                ←
              </button>
              <span style={{ fontSize: "0.8rem" }}>
                {page} / {lastPage}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => loadProducts(page + 1)}
                disabled={page === lastPage}>
                →
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 20, maxHeight: "90vh", overflow: "auto" }}>
            <h3>{editId ? "Edit" : "Tambah"} Produk</h3>
            <form onSubmit={handleSave}>
              {/* Upload gambar */}
              <div className="form-group">
                <label className="form-label">Gambar</label>

                {imageFile ? (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={URL.createObjectURL(imageFile)}
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
                      ✕ Batal
                    </button>
                  </div>
                ) : form.image ? (
                  <div style={{ textAlign: "center", position: "relative" }}>
                    <img
                      src={`https://api.fofimart.com${form.image}`}
                      style={{
                        width: "80%",
                        height: 320,
                        borderRadius: 6,
                        objectFit: "cover",
                        opacity: 0.7,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        gap: 8,
                      }}>
                      <label
                        style={{
                          background: "var(--bg-card)",
                          padding: "6px 12px",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}>
                        📷 Ganti
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files[0])}
                          style={{ display: "none" }}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          await api.put(`/admin/perhitungan/${editId}`, {
                            image: "",
                          });
                          setForm({ ...form, image: "" });
                          showToast("🗑 Gambar dihapus");
                        }}>
                        🗑 Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    style={{
                      display: "block",
                      border: "2px dashed var(--border)",
                      borderRadius: 10,
                      padding: 20,
                      textAlign: "center",
                      cursor: "pointer",
                    }}>
                    <p>📷 Klik upload</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </label>
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
                <label className="form-label">Kategori</label>
                <SearchSelect
                  options={CATEGORIES}
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val })}
                  placeholder="Cari kategori..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Satuan</label>
                <SearchSelect
                  options={UNITS}
                  value={form.unit || "pack"}
                  onChange={(val) => setForm({ ...form, unit: val })}
                  placeholder="Cari satuan..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stok</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Base Price (Rp)</label>
                <PriceInput
                  value={form.base_price}
                  onChange={(val) => setForm({ ...form, base_price: val })}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Profit %</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.profit_percent ?? 2}
                    onChange={(e) =>
                      setForm({ ...form, profit_percent: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Ops %</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.ops_percent ?? 15}
                    onChange={(e) =>
                      setForm({ ...form, ops_percent: e.target.value })
                    }
                  />
                </div>
              </div>
              {/* DISKON */}
              <div className="form-group">
                <label className="form-label">Diskon</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <select
                      className="form-input"
                      value={form.discount_type || ""}
                      onChange={(e) =>
                        setForm({ ...form, discount_type: e.target.value })
                      }>
                      <option value="">Pilih Tipe</option>
                      <option value="percentage">📊 Persentase (%)</option>
                      <option value="fixed">💰 Nominal (Rp)</option>
                    </select>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max={
                        form.discount_type === "percentage" ? "100" : "1000000"
                      }
                      value={form.discount}
                      onChange={(e) =>
                        setForm({ ...form, discount: e.target.value })
                      }
                      placeholder="0"
                    />
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}>
                      {/* {form.discount_type === "percentage" ? "%" : "Rp"} */}
                    </span>
                  </div>
                </div>
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
                  checked={form.is_active ?? false}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                Aktif (tampil di etalase)
              </label>
              <button
                className="btn btn-dark btn-block"
                type="submit"
                style={{ marginTop: 12 }}>
                {editId ? "Simpan" : "Tambah"}
              </button>
            </form>
          </div>
        </div>
      )}
      <AlertModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Konfirmasi Hapus"
        message="Yakin ingin menghapus data perhitungan ini? Tindakan tidak dapat dibatalkan."
        type="warning"
      />
      <Toast />
    </AdminLayout>
  );
}
