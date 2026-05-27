import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/format";
import { showToast } from "../common/Toast";

export default function ProductModal({ isOpen, onClose }) {
  const { loading, get } = useApi();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const categories = [
    "Semua",
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
  ];

  useEffect(() => {
    if (isOpen) loadProducts(1);
  }, [isOpen, activeCategory]);

  const loadProducts = async (pageNum = 1) => {
    try {
      const params = { page: pageNum, per_page: 20 };
      if (activeCategory && activeCategory !== "Semua")
        params.category = activeCategory;
      if (search) params.search = search;
      const data = await get("/products", params);
      setProducts(data?.data || []);
      setPage(data?.current_page || 1);
      setLastPage(data?.last_page || 1);
    } catch (e) {}
  };

  const handleAdd = (product) => {
    // Tambah ke cart global
    addItem(product);

    // Update selected_items di localStorage
    const saved = localStorage.getItem("selected_items");
    let selected = saved ? JSON.parse(saved) : [];

    const existing = selected.find((i) => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      selected.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        stock: product.stock,
        qty: 1,
      });
    }

    localStorage.setItem("selected_items", JSON.stringify(selected));

    // Notif
    showToast(`${product.name} ditambahkan ke pesanan`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="product-modal-header">
          <h3>Tambah Produk</h3>
          <button onClick={onClose} className="product-modal-close">
            ×
          </button>
        </div>

        {/* Search */}
        <div className="product-modal-search">
          <span className="search-icon"></span>
          <input
            type="text"
            className="form-input search"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadProducts(1);
            }}
          />
        </div>

        {/* Categories */}
        <div className="product-modal-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat === activeCategory ? "" : cat);
                setSearch("");
              }}
              className={`product-modal-cat-btn ${activeCategory === cat ? "active" : ""}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="product-modal-list">
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <span className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                padding: 20,
              }}>
              Tidak ada produk
            </p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-modal-item">
                <div className="product-modal-item-icon">
                  {product.image ? (
                    <img
                      src={`https://api.fofimart.com${product.image}`}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    "📦"
                  )}
                </div>
                <div className="product-modal-item-info">
                  <p className="product-modal-item-name">{product.name}</p>
                  <p className="product-modal-item-price">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <button
                  className="btn btn-dark btn-sm"
                  onClick={() => handleAdd(product)}
                  disabled={product.stock === 0}>
                  {product.stock === 0 ? "Habis" : "+"}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="product-modal-pagination">
            <button
              onClick={() => loadProducts(page - 1)}
              disabled={page === 1}
              className="btn btn-outline btn-sm">
              ←
            </button>
            <span>
              {page} / {lastPage}
            </span>
            <button
              onClick={() => loadProducts(page + 1)}
              disabled={page === lastPage}
              className="btn btn-outline btn-sm">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
