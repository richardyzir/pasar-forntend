import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import { formatCurrency } from "../../utils/format";
import { showToast } from "../../components/common/Toast";
import Toast from "../../components/common/Toast";
import PriceInput from "../../components/common/PriceInput";
import SearchSelect from "../../components/common/SearchSelect";
import AdminLayout from "../../components/layout/AdminLayout";

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

export default function AdminProducts() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [uploadId, setUploadId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState(null);

  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    base_price: "",
    packing_fee: "",
    admin_fee_product: "",
    kurir_fee: "",
    stock: "",
    category: "",

    is_active: true,
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (!u.role || (u.role !== "admin" && u.role !== "master")) {
      router.push("/admin/login");
      return;
    }

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
    setCanCreate(isMaster || perms.products?.create);
    setCanEdit(isMaster || perms.products?.edit);
    setCanDelete(isMaster || perms.products?.delete);

    loadProducts();
  }, [search]);

  const loadProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/products", {
        params: { search, per_page: 20, page: pageNum },
      });
      setProducts(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (e) {}
    setLoading(false);
  };

  const calcPrice = (f) => {
    const base = Number(f.base_price) || 0;
    const packing = Number(f.packing_fee) || 0;
    const admin = Number(f.admin_fee_product) || 0;
    const kurir = Number(f.kurir_fee) || 0;
    return base + packing + admin + kurir;
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadProducts(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile) {
      const fd = new FormData();
      fd.append("image", imageFile);
      const { data: imgData } = await api.post(
        `/admin/products/upload-temp`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      form.image = imgData.image;
    }

    try {
      if (editId) {
        await api.put(`/admin/products/${editId}`, form);
        showToast("✅ Update Item Berhasil");
      } else {
        await api.post("/admin/products", form);
        showToast("✅ Tambah Item Berhasil");
      }
      setShowForm(false);
      setEditId(null);
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        is_active: true,
      });
      loadProducts();
    } catch (err) {
      alert("Gagal menyimpan");
    }
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      base_price: product.base_price || "",
      packing_fee: product.packing_fee || "",
      admin_fee_product: product.admin_fee_product || "",
      kurir_fee: product.kurir_fee || "",
      stock: product.stock,
      category: product.category || "",
      is_active: product.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin hapus?")) {
      await api.delete(`/admin/products/${id}`);
      showToast("🗑 Produk berhasil dihapus");
      loadProducts(page);
    }
  };

  return (
    <AdminLayout title="Produk">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>📝 Produk</h1>
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
              setForm({
                name: "",
                description: "",
                price: "",
                base_price: "",
                packing_fee: "",
                admin_fee_product: "",
                kurir_fee: "",
                stock: "",
                category: "",
                is_active: true,
              });
              setShowForm(true);
            }}>
            + Tambah Produk
          </button>
        )}
      </div>

      <input
        type="text"
        className="form-input"
        placeholder="Cari produk..."
        value={search}
        onChange={handleSearch}
        style={{ marginBottom: 16 }}
      />

      {/* Products Table */}
      {loading ? (
        <p style={{ textAlign: "center", padding: 40 }}>Memuat...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.8rem",
            }}>
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--border)",
                  textAlign: "left",
                }}>
                <th style={{ padding: "8px 4px" }}>Gambar</th>
                <th style={{ padding: "8px 4px" }}>Nama</th>
                <th style={{ padding: "8px 4px" }}>Kat</th>
                <th style={{ padding: "8px 4px" }}>Base</th>
                <th style={{ padding: "8px 4px" }}>Packing</th>
                <th style={{ padding: "8px 4px" }}>Admin</th>
                <th style={{ padding: "8px 4px" }}>Kurir</th>
                <th style={{ padding: "8px 4px" }}>Jual</th>
                <th style={{ padding: "8px 4px" }}>Stok</th>
                <th style={{ padding: "8px 4px" }}>Aktif</th>
                <th style={{ padding: "8px 4px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    fontSize: "0.75rem",
                  }}>
                  <td style={{ padding: "6px 4px" }}>
                    {product.image ? (
                      <img
                        src={`https://api.fofimart.com${product.image}`}
                        alt=""
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => setPreviewId(product.id)}
                      />
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "0.6rem", padding: "2px 6px" }}
                        onClick={() => setUploadId(product.id)}>
                        📷
                      </button>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      fontWeight: 600,
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {product.name}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      color: "var(--text-secondary)",
                      fontSize: "0.65rem",
                    }}>
                    {product.category || "-"}
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    {formatCurrency(product.base_price)}
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    {formatCurrency(product.packing_fee)}
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    {formatCurrency(product.admin_fee_product)}
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    {formatCurrency(product.kurir_fee)}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      fontWeight: 700,
                      color: "var(--primary)",
                    }}>
                    {formatCurrency(product.price)}
                  </td>
                  <td style={{ padding: "6px 4px" }}>{product.stock}</td>
                  <td style={{ padding: "6px 4px" }}>
                    <span
                      className={`badge ${product.is_active ? "badge-success" : "badge-gray"}`}
                      style={{ fontSize: "0.6rem" }}>
                      {product.is_active ? "✓" : "✕"}
                    </span>
                  </td>
                  <td style={{ padding: "6px 4px" }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {canEdit && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEdit(product)}>
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product.id)}>
                          🗑
                        </button>
                      )}
                    </div>
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
                alignItems: "center",
                gap: 12,
                marginTop: 16,
                paddingBottom: 20,
              }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => loadProducts(page - 1)}
                disabled={page === 1}>
                ←
              </button>
              <span
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
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

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 20, maxHeight: "90vh", overflow: "auto" }}>
            <h3 style={{ marginBottom: 16 }}>
              {editId ? "Edit" : "Tambah"} Produk
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Upload Gambar di Form */}
              <div
                className="form-group"
                style={{ textAlign: "center", marginBottom: 16 }}>
                <label className="form-label">Gambar Produk</label>

                {imageFile ? (
                  <div style={{ marginBottom: 8 }}>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 160,
                        borderRadius: 12,
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
                  <div style={{ marginBottom: 8 }}>
                    <img
                      src={`https://api.fofimart.com${form.image}`}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 160,
                        borderRadius: 12,
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <label
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: 12,
                      padding: 24,
                      display: "block",
                      cursor: "pointer",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}>
                    <p style={{ fontSize: "0.875rem" }}>
                      📷 Klik untuk upload gambar
                    </p>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                      }}>
                      JPG, PNG, WebP (max 2MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setImageFile(file);
                      }}
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
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                {/* <label className="form-label">Kategori</label> */}
                <SearchSelect
                  label="Kategori"
                  options={CATEGORIES}
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val })}
                  placeholder="Cari kategori..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stok</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <SearchSelect
                  label="Unit / Satuan"
                  options={UNITS}
                  value={form.unit || "pack"}
                  onChange={(val) => setForm({ ...form, unit: val })}
                  placeholder="Cari unit..."
                />
              </div>

              <div className="form-group">
                {/* <label className="form-label">Harga Pokok (Base)</label> */}
                <PriceInput
                  label="Harga Pokok (Base)"
                  value={form.base_price}
                  onChange={(val) => setForm({ ...form, base_price: val })}
                />
              </div>

              <div className="form-group">
                {/* <label className="form-label">Biaya Packing</label> */}
                <PriceInput
                  label="Biaya Packing"
                  value={form.packing_fee}
                  onChange={(val) => setForm({ ...form, packing_fee: val })}
                />
              </div>

              <div className="form-group">
                {/* <label className="form-label">Biaya Admin</label> */}
                <PriceInput
                  label="Biaya Admin"
                  value={form.admin_fee_product}
                  onChange={(val) =>
                    setForm({ ...form, admin_fee_product: val })
                  }
                />
              </div>

              <div className="form-group">
                {/* <label className="form-label">Biaya Kurir</label> */}
                <PriceInput
                  label="Biaya Kurir"
                  value={form.kurir_fee}
                  onChange={(val) => setForm({ ...form, kurir_fee: val })}
                />
              </div>

              <div className="form-group">
                {/* <label className="form-label">Harga Jual (Otomatis)</label> */}
                <PriceInput
                  label="Harga Jual (Otomatis)"
                  value={form.price || calcPrice(form)}
                  disabled
                  onChange={() => {}}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Diskon</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipe Diskon</label>
                <select
                  className="form-input"
                  value={form.discount_type || ""}
                  onChange={(e) =>
                    setForm({ ...form, discount_type: e.target.value })
                  }>
                  <option value="">Tidak ada</option>
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                  <span>Aktif</span>
                </label>
              </div>
              <button className="btn btn-dark btn-block" type="submit">
                {editId ? "Simpan" : "Tambah"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Image Modal */}
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
            <h3 style={{ marginBottom: 12 }}>📷 Upload Gambar Produk</h3>

            {/* Preview */}
            {imageFile && (
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ marginBottom: 12, width: "100%" }}
            />

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
                onClick={async () => {
                  if (!imageFile) return;
                  const formData = new FormData();
                  formData.append("image", imageFile);
                  await api.post(
                    `/admin/products/${uploadId}/image`,
                    formData,
                    {
                      headers: { "Content-Type": "multipart/form-data" },
                    },
                  );
                  showToast("✅ Gambar berhasil diupload");
                  setUploadId(null);
                  setImageFile(null);
                  loadProducts(page);
                }}>
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewId &&
        (() => {
          const product = products.find((p) => p.id === previewId);
          if (!product) return null;
          return (
            <div className="modal-overlay" onClick={() => setPreviewId(null)}>
              <div
                className="product-modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: 20,
                  maxWidth: 400,
                  maxHeight: "90vh",
                  overflow: "auto",
                }}>
                {/* Gambar */}
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  {product.image ? (
                    <img
                      src={`https://api.fofimart.com${product.image}`}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                        background: "var(--bg-card-alt)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "4rem",
                      }}>
                      📦
                    </div>
                  )}
                </div>

                {/* Detail */}
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}>
                  {product.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                  }}>
                  {product.description || "Tidak ada deskripsi"}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    fontSize: "0.75rem",
                  }}>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Kategori</p>
                    <p style={{ fontWeight: 600 }}>{product.category || "-"}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Stok</p>
                    <p style={{ fontWeight: 600 }}>{product.stock}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Harga Pokok</p>
                    <p style={{ fontWeight: 600 }}>
                      {formatCurrency(product.base_price)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Harga Jual</p>
                    <p className="product-price">
                      {formatCurrency(product.final_price || product.price)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Status</p>
                    <span
                      className={`badge ${product.is_active ? "badge-success" : "badge-gray"}`}
                      style={{ fontSize: "0.6rem" }}>
                      {product.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setPreviewId(null);
                      handleEdit(product);
                    }}>
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setPreviewId(null)}>
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      <Toast />
    </AdminLayout>
  );
}
