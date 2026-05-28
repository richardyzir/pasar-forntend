import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import { useApi } from "../../hooks/useApi";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../utils/format";
import { showToast } from "../../components/common/Toast";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { loading, get } = useApi();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  const loadProduct = async () => {
    try {
      const data = await get(`/products/${id}`);
      setProduct(data?.data || data);
    } catch (e) {}
  };

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }
    addItem(product, qty);
    showToast(`${product.name} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/checkout?product=${id}&qty=${qty}`);
      return;
    }
    addItem(product, qty);
    router.push("/checkout");
  };

  if (loading)
    return (
      <Layout>
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      </Layout>
    );

  if (!product)
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <span style={{ fontSize: "4rem" }}>📦</span>
          <h2 style={{ color: "var(--text)" }}>Produk tidak ditemukan</h2>
          <Link href="/" className="btn btn-dark" style={{ marginTop: 16 }}>
            Kembali
          </Link>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="detail-container">
        {/* Kiri - Gambar */}
        <div className="detail-image-section">
          <div>
            {product.image ? (
              <img
                src={`https://api.fofimart.com${product.image}`}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "📦"
            )}
          </div>
        </div>

        {/* Kanan - Info */}
        <div className="detail-info-section">
          <h1 className="detail-title">
            {product.name} / {product.unit || "pack"}
          </h1>
          <span className="badge badge-primary detail-badge">
            {product.category || "Umum"}
          </span>

          {product.discount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}>
              <span
                style={{
                  fontSize: "1rem",
                  textDecoration: "line-through",
                  color: "var(--text-muted)",
                }}>
                {formatCurrency(product.price)}
              </span>
              <span className="badge badge-danger">
                {product.discount_type === "percentage"
                  ? `${product.discount}%`
                  : `-${formatCurrency(product.discount)}`}
              </span>
            </div>
          )}
          <p className="detail-price">
            {formatCurrency(product.final_price ?? product.price)}
          </p>

          <div className="detail-stock-row">
            <span
              style={{
                color: product.stock > 0 ? "var(--secondary)" : "var(--danger)",
                fontWeight: 600,
              }}>
              {product.stock > 0 ? `📦 Stok: ${product.stock}` : "❌ Habis"}
            </span>
            <span>⭐ 4.8 (120 terjual)</span>
          </div>

          <h3 className="detail-section-title">Deskripsi</h3>
          <p className="detail-description">
            {product.description || "Tidak ada deskripsi"}
          </p>

          {product.stock > 0 && (
            <div className="detail-qty-row">
              <span className="detail-qty-label">Jumlah:</span>
              <div className="detail-qty-control">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="detail-qty-btn">
                  −
                </button>
                <span className="detail-qty-value">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="detail-qty-btn">
                  +
                </button>
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button
              className="btn btn-dark"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}>
              🛒 Keranjang
            </button>
            <button
              className="btn btn-accent"
              style={{ flex: 1 }}
              onClick={handleBuyNow}
              disabled={product.stock === 0}>
              ⚡ Beli Langsung
            </button>
          </div>

          <button
            className="btn btn-kembali"
            style={{ marginTop: 10 }}
            onClick={() => router.push("/")}>
            ← Kembali
          </button>

          <div className="detail-info-footer">
            <span>🚚 Gratis Ongkir</span>
            <span>🔄 7 Hari Retur</span>
            <span>✅ Garansi Kualitas</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
