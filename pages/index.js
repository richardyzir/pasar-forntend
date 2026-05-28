import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import BannerSlider from "../components/home/BannerSlider";
import Categories from "../components/home/Categories";
import PromoSection from "../components/home/PromoSection";
import ProductCardPremium from "../components/product/ProductCardPremium";
import { useApi } from "../hooks/useApi";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/router";
import { showToast } from "../components/common/Toast";

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const { loading, get } = useApi();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { category } = router.query;

  useEffect(() => {
    loadProducts("", category);
  }, [category]);

  const loadProducts = async (searchTerm = "", categoryFilter = "") => {
    try {
      const params = { search: searchTerm, per_page: 100 };
      if (categoryFilter) params.category = categoryFilter;
      const data = await get("/products", params);
      setProducts(data?.data || []);
    } catch (e) {}
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadProducts(e.target.value);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/");
      return;
    }
    addItem(product);
    showToast(`${product.name} ditambahkan`);
  };

  return (
    <Layout>
      {/* Banner Full Width - DI LUAR CONTAINER */}
      <div className="banner-full">
        <BannerSlider />
      </div>

      {/* Categories & Promo & Products - DI DALAM CONTAINER */}
      <div className="container">
        <Categories />
        <PromoSection />

        {/* ===== LOGGED OUT ===== */}
        {!isAuthenticated && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 4,
                }}>
                🛍️ Produk Terbaru
              </h2>
              <p
                style={{
                  fontSize: "0.813rem",
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}>
                Temukan kebutuhan harian Anda
              </p>

              <div className="sticky-search">
                <div className="search-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="form-input search"
                    placeholder="Cari kebutuhan anda"
                    value={search}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              <div className="product-grid">
                {products.map((product) => (
                  <ProductCardPremium
                    key={product.id}
                    product={product}
                    onAddToCart={() => router.push("/login")}
                  />
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <button
                  className="btn btn-dark btn-lg"
                  onClick={() => router.push("/register")}>
                  📝 Daftar & Mulai Belanja
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== LOGGED IN ===== */}
        {isAuthenticated && (
          <>
            <div style={{ marginBottom: 4 }}>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--text)",
                }}>
                👋 Selamat Datang, {user?.name?.split(" ")[0]}
              </h2>
              <p
                style={{
                  fontSize: "0.813rem",
                  color: "var(--text-secondary)",
                }}>
                Mau belanja apa hari ini?
              </p>
            </div>

            <div className="sticky-search">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="form-input search"
                  placeholder="Cari kebutuhan anda"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-page">
                <span className="spinner spinner-lg" />
              </div>
            ) : (
              <>
                <div id="produk-section">
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: 5,
                    }}>
                    🛍️ Semua Produk
                  </h2>
                </div>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCardPremium
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
