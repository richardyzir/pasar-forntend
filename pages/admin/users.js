import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../utils/api";
import { showToast } from "../../components/common/Toast";
import Toast from "../../components/common/Toast";

const ROLES = ["master", "admin", "kurir", "user"];
const ROLE_COLORS = {
  master: "badge-danger",
  admin: "badge-primary",
  kurir: "badge-warning",
  user: "badge-gray",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
    permissions: {
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: false, edit: true, delete: false },
      banners: { view: true, create: true, edit: true, delete: true },
      users: { view: false, create: false, edit: false, delete: false },
    },
  });
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [search, filterRole]);

  const loadUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { search, per_page: 20, page: pageNum };
      if (filterRole) params.role = filterRole;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data || []);
      setPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (e) {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${editId}`, payload);
        showToast("✅ User diperbarui");
      } else {
        await api.post("/admin/users", form);
        showToast("✅ User ditambahkan");
      }
      setShowForm(false);
      setEditId(null);
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "user",
      });
      loadUsers(page);
    } catch (err) {
      showToast("❌ " + (err.response?.data?.message || "Gagal"));
    }
  };

  const handleEdit = (u) => {
    setEditId(u.id);

    // Default permissions
    const defaultPerms = {
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: false, edit: true, delete: false },
      banners: { view: true, create: true, edit: true, delete: true },
      users: { view: false, create: false, edit: false, delete: false },
    };

    // Parse dari database
    const permsObj = {};
    if (
      u.permissions &&
      Array.isArray(u.permissions) &&
      u.permissions.length > 0
    ) {
      u.permissions.forEach((p) => {
        permsObj[p.module] = {
          view: p.can_view,
          create: p.can_create,
          edit: p.can_edit,
          delete: p.can_delete,
        };
      });
    }

    const mergedPerms = { ...defaultPerms, ...permsObj };

    setForm({
      name: u.name,
      email: u.email,
      username: u.username || "",
      password: "",
      phone: u.phone,
      address: u.address || "",
      role: u.role,
      permissions: mergedPerms,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin hapus user ini?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        showToast("🗑 User dihapus");
        loadUsers(page);
      } catch (err) {
        showToast("❌ " + (err.response?.data?.error || "Gagal"));
      }
    }
  };

  const handlePermissionChange = (module, action, checked) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: checked,
        },
      },
    }));
  };

  return (
    <AdminLayout title="Users">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>👥 User List</h1>
        <button
          className="btn btn-dark btn-sm"
          onClick={() => {
            setEditId(null);
            setForm({
              name: "",
              email: "",
              username: "",
              password: "",
              phone: "",
              address: "",
              role: "user",
              permissions: {
                products: {
                  view: true,
                  create: true,
                  edit: true,
                  delete: true,
                },
                orders: {
                  view: true,
                  create: false,
                  edit: true,
                  delete: false,
                },
                banners: { view: true, create: true, edit: true, delete: true },
                users: {
                  view: false,
                  create: false,
                  edit: false,
                  delete: false,
                },
              },
            });
            setShowForm(true);
          }}>
          + Tambah User
        </button>
      </div>

      {/* Filter */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          className="form-input"
          placeholder="Cari nama/email/HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="form-input"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ width: 120 }}>
          <option value="">All</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
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
                <th style={{ padding: "8px 6px" }}>Nama</th>
                <th style={{ padding: "8px 6px" }}>Username</th>
                <th style={{ padding: "8px 6px" }}>Email</th>
                <th style={{ padding: "8px 6px" }}>HP</th>
                <th style={{ padding: "8px 6px" }}>Role</th>
                <th style={{ padding: "8px 6px" }}>Poin</th>
                <th style={{ padding: "8px 6px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 600 }}>
                    {u.name}
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      color: "var(--text-secondary)",
                    }}>
                    {u.username}
                  </td>
                  <td
                    style={{
                      padding: "8px 6px",
                      color: "var(--text-secondary)",
                    }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "8px 6px" }}>{u.phone}</td>
                  <td style={{ padding: "8px 6px" }}>
                    <span
                      className={`badge ${ROLE_COLORS[u.role] || "badge-gray"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "8px 6px" }}>{u.points || 0}</td>
                  <td style={{ padding: "8px 6px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleEdit(u)}>
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u.id)}>
                        🗑
                      </button>
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
                gap: 12,
                marginTop: 16,
              }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => loadUsers(page - 1)}
                disabled={page === 1}>
                ←
              </button>
              <span
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {page} / {lastPage}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => loadUsers(page + 1)}
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
              {editId ? "Edit" : "Tambah"} User
            </h3>
            <form onSubmit={handleSubmit}>
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
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Password {editId && "(kosongkan jika tidak diubah)"}
                </label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required={!editId}
                />
              </div>
              <div className="form-group">
                <label className="form-label">No. HP</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat</label>
                <textarea
                  className="form-textarea"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginTop: 8 }}>
                <label
                  className="form-label"
                  style={{ fontWeight: 700, marginBottom: 8 }}>
                  🔐 Permissions
                </label>

                {Object.keys(form.permissions || {}).map((module) => (
                  <div
                    key={module}
                    style={{
                      marginBottom: 8,
                      padding: "8px 10px",
                      background: "var(--bg-card-alt)",
                      borderRadius: 8,
                    }}>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}>
                      {module}
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["view", "create", "edit", "delete"].map((action) => (
                        <label
                          key={action}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: "0.65rem",
                            cursor: "pointer",
                          }}>
                          <input
                            type="checkbox"
                            checked={
                              form.permissions?.[module]?.[action] || false
                            }
                            onChange={(e) =>
                              handlePermissionChange(
                                module,
                                action,
                                e.target.checked,
                              )
                            }
                          />
                          {action}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-dark btn-block" type="submit">
                {editId ? "Simpan" : "Tambah"}
              </button>
            </form>
          </div>
        </div>
      )}
      <Toast />
    </AdminLayout>
  );
}
