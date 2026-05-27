import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const { theme, icon, toggle } = useTheme();
  const [user, setUser] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [ready, setReady] = useState(false);

  const allMenuItems = [
    { path: "/admin/dashboard", label: "Beranda", icon: "📊", module: null },
    { path: "/admin/orders", label: "Pesanan", icon: "📦", module: "orders" },
    {
      path: "/admin/products",
      label: "Produk",
      icon: "📝",
      module: "products",
    },
    {
      path: "/admin/categories",
      label: "Kategori",
      icon: "📂",
      module: "categories",
    },
    { path: "/admin/banners", label: "Banner", icon: "🎨", module: "banners" },
    { path: "/admin/users", label: "Users", icon: "👥", module: "users" },
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(saved);

    // Parse permissions dari array ke object
    const perms = {};
    if (saved.permissions && Array.isArray(saved.permissions)) {
      saved.permissions.forEach((p) => {
        perms[p.module] = {
          view: !!p.can_view, // ← !! konversi ke boolean
          create: !!p.can_create,
          edit: !!p.can_edit,
          delete: !!p.can_delete,
        };
      });
    }

    // Filter menu
    const items = allMenuItems.filter((item) => {
      if (item.module === null) return true;
      if (saved.role === "master") return true;
      return perms[item.module]?.view === true;
    });

    setMenuItems(items);
    setReady(true);
  }, []);

  const isActive = (path) => router.pathname === path;
  const isKurir = user.role === "kurir";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}>
      <header
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
        <Link
          href={isKurir ? "/kurir/dashboard" : "/admin/dashboard"}
          style={{
            fontWeight: 800,
            fontSize: "1rem",
            color: "var(--text)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}>
          🛍️ Fofi Mart
        </Link>

        <nav className="admin-nav-desktop" style={{ display: "flex", gap: 4 }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: isActive(item.path) ? 600 : 400,
                color: isActive(item.path)
                  ? "var(--primary)"
                  : "var(--text-secondary)",
                background: isActive(item.path)
                  ? "var(--primary-light)"
                  : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}>
              <span className="hide-mobile">
                {item.icon} {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={toggle}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "5px 10px",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}>
            {icon}
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}>
            🚪
          </button>
        </div>
      </header>

      <div style={{ padding: "16px 20px", maxWidth: 1100, margin: "0 auto" }}>
        {children}
      </div>

      <nav className="admin-mobile-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={isActive(item.path) ? "active" : ""}>
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
