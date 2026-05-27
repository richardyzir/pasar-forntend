import Header from "./Header";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useRouter } from "next/router";
import { useOrderCount } from "../../hooks/useOrderCount";

export default function Layout({ children }) {
  const { user } = useAuth();
  const { items, totalItems } = useCart();
  const router = useRouter();
  const orderCount = useOrderCount();
  const isActive = (path) => (router.pathname === path ? "active" : "");

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div className="header-spacer" />
      <main
        className="container py-8"
        style={{ flex: 1, overflowX: "hidden", maxWidth: "100vw" }}>
        {children}
      </main>

      {/* Bottom Nav - HANYA MOBILE */}
      <nav className="mobile-nav">
        <Link href="/" className={isActive("/")}>
          <span className="icon">🏠</span>
          <span>Beranda</span>
        </Link>

        <Link href="/cart" className={isActive("/cart")}>
          <span className="icon" style={{ position: "relative" }}>
            🛒
            {totalItems > 0 && <span className="badge-cart">{totalItems}</span>}
          </span>
          <span>Keranjang</span>
        </Link>

        <Link href="/orders" className={isActive("/orders")}>
          <span className="icon" style={{ position: "relative" }}>
            📦
            {orderCount > 0 && <span className="badge-cart">{orderCount}</span>}
          </span>
          <span>Pesanan</span>
        </Link>

        {user ? (
          <Link href="/profile" className={isActive("/profile")}>
            <span className="icon">👤</span>
            <span>Profil</span>
          </Link>
        ) : (
          <Link href="/login" className={isActive("/login")}>
            <span className="icon">👤</span>
            <span>Login</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
