import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import ProductCardPremium from "../../components/product/ProductCardPremium";
import { useApi } from "../../hooks/useApi";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../components/common/Toast";
import api from "../../utils/api";

export default function CategoryPage() {
  const router = useRouter();
  const { name } = router.query;
  const { loading, get } = useApi();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  //   const { data } = await api.get('/categories');

  useEffect(() => {
    loadCategories();
    if (name) {
      setActiveCategory(decodeURIComponent(name));
      loadProducts(decodeURIComponent(name));
    }
  }, [name]);

  const loadCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data || []);
    } catch (e) {}
  };

  const loadProducts = async (catName, searchTerm = "") => {
    try {
      const params = { per_page: 50 };
      if (catName) params.category = catName;
      if (searchTerm) params.search = searchTerm;
      const data = await get("/products", params);
      setProducts(data?.data || []);
    } catch (e) {}
  };

  const handleCategoryChange = (catName) => {
    setActiveCategory(catName);
    setSearch("");
    loadProducts(catName);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    loadProducts(activeCategory, val);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    addItem(product);
    showToast(`${product.name} ditambahkan`);
  };

  return (
    <Layout>
      {/* Back + Title */}
      <button
        onClick={() => router.push("/")}
        style={{
          background: "var(--bg-card)",
          border: "1px solid",
          borderRadius: 8,
          padding: "6px 14px",
          cursor: "pointer",
          fontSize: "0.85rem",
          color: "red",
          marginTop: 65,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
        ← Kembali
      </button>

      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 4,
        }}>
        {activeCategory || "Semua Kategori"}
      </h1>
      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginBottom: 12,
        }}>
        {products.length} produk ditemukan
      </p>

      {/* Categories Scroll */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          marginBottom: 8,
          paddingBottom: 8,
          scrollbarWidth: "none",
          position: "sticky",
          top: 56,
          background: "var(--bg)",
          zIndex: 10,
          paddingTop: 4,
        }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.name)}
            className={`btn btn-sm ${activeCategory === cat.name ? "btn-dark" : "btn-outline"}`}
            style={{
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.7rem",
              border: "1px solid var(--border-light)",
            }}>
            <span>{cat.emoji || "📂"}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrapper" style={{ marginBottom: 16 }}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input search"
          placeholder="cari product"
          value={search}
          onChange={handleSearch}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
          }}
        />
      </div>

      {/* Products */}
      {loading ? (
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <span style={{ fontSize: "3rem" }}>📦</span>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
            Tidak ada produk
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCardPremium
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
