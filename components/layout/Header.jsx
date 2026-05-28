import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useOrderCount } from "../../hooks/useOrderCount";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "next/router";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { items } = useCart();
  const orderCount = useOrderCount();
  const { theme, icon, toggle } = useTheme();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="header-logo">
          🛍️ <span className="hide-mobile">Fofi Mart</span>
          <span className="hide-desktop">Fofi Mart</span>
        </Link>

        <nav className="header-nav hide-mobile">
          <Link
            href="/"
            className={router.pathname === "/" ? "nav-active" : ""}>
            Beranda
          </Link>
          <Link
            href="/cart"
            className={`cart-badge ${router.pathname === "/cart" ? "nav-active" : ""}`}>
            🛒 Keranjang
            {items.length > 0 && (
              <span className="cart-count">{items.length}</span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                href="/orders"
                className={`cart-badge ${router.pathname === "/orders" ? "nav-active" : ""}`}>
                📦 Pesanan
                {orderCount > 0 && (
                  <span className="cart-count">{orderCount}</span>
                )}
              </Link>
              <Link
                href="/profile"
                className={router.pathname === "/profile" ? "nav-active" : ""}>
                👤 Profil
              </Link>
              {/* <button onClick={logout} className="btn btn-ghost btn-sm">
                Keluar
              </button> */}
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
          )}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={toggle}
            title={`Mode: ${theme}`}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "var(--text-secondary)",
            }}>
            {icon}
          </button>
          {user ? (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}>
              🚪 Keluar
            </button>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
