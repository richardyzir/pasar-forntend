import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../utils/format";
import Link from "next/link";
import ProductModal from "../components/product/ProductModal";
import api from "../utils/api";

export default function Cart() {
  const router = useRouter();
  const { items, total, updateQty, removeItem, clearCart } = useCart();
  const [selected, setSelected] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    selected.length === items.length
      ? setSelected([])
      : setSelected(items.map((i) => i.id));
  };

  useEffect(() => {
    syncPrices();
  }, []);

  useEffect(() => {
    syncPrices();
  }, []);

  const syncPrices = async () => {
    if (items.length === 0) return;
    try {
      const ids = items.map((i) => i.id).join(",");
      const { data } = await api.get("/products", { ids, per_page: 100 });
      const serverProducts = data?.data || [];

      let changed = false;
      const updated = items.map((item) => {
        const sp = serverProducts.find((p) => p.id === item.id);
        if (sp) {
          const finalPrice = sp.final_price ?? sp.price;
          if (finalPrice !== item.price) {
            changed = true;
            return {
              ...item,
              price: finalPrice,
              stock: sp.stock,
              discount: sp.discount,
              discount_type: sp.discount_type,
              original_price: sp.price,
            };
          }
        }
        return item;
      });

      if (changed) {
        localStorage.setItem("pasar_cart", JSON.stringify(updated));
        window.location.reload();
      }
    } catch (e) {}
  };

  const selectedItems = items.filter((i) => selected.includes(i.id));
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.price * i.qty,
    0,
  );

  if (items.length === 0) {
    return (
      <Layout>
        <div className="cart-empty">
          <span>🛒</span>
          <h2>Keranjang Kosong</h2>
          <p>Belum ada produk di keranjang. Yuk mulai belanja!</p>
          <Link href="/" className="btn btn-dark btn-lg">
            Mulai Belanja
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h1>Keranjang</h1>
          <button
            onClick={clearCart}
            className="btn btn-outline btn-sm"
            style={{
              border: "1px solid",
              color: "red",
            }}>
            Hapus Seluruh Item
          </button>
        </div>

        {/* Select All */}
        <div className="cart-select-all">
          <label className="cart-checkbox">
            <input
              type="checkbox"
              checked={selected.length === items.length && items.length > 0}
              onChange={toggleAll}
            />
            <span>Pilih Semua ({items.length})</span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowProductModal(true)}
              style={{ border: "1px solid", marginLeft: "auto" }}>
              + Tambah Item
            </button>
          </label>
        </div>

        {/* List Items */}
        <div className="cart-items">
          {items.map((item) => (
            <div
              key={item.id}
              className={`cart-item ${selected.includes(item.id) ? "cart-item-selected" : ""}`}>
              <label className="cart-checkbox">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
              </label>

              <div className="cart-item-icon">📦</div>

              <div className="cart-item-info">
                <h3>{item.name}</h3>
                {item.discount > 0 && (
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        textDecoration: "line-through",
                        color: "var(--text-muted)",
                      }}>
                      {formatCurrency(item.original_price || item.price)}
                    </span>
                    <span
                      className="badge badge-danger"
                      style={{ fontSize: "0.55rem" }}>
                      {item.discount_type === "percentage"
                        ? `${item.discount}%`
                        : `-Rp`}
                    </span>
                  </div>
                )}
                <p className="cart-item-price">{formatCurrency(item.price)}</p>
              </div>

              <div className="cart-item-qty">
                <button onClick={() => updateQty(item.id, item.qty - 1)}>
                  −
                </button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)}>
                  +
                </button>
              </div>

              <p className="cart-item-subtotal">
                {formatCurrency(item.price * item.qty)}
              </p>
            </div>
          ))}
        </div>

        <div className="cart-spacer" />
      </div>

      {/* Summary Sticky Bottom (mobile) */}
      <div className="cart-summary-sticky">
        <div className="cart-summary-inner">
          <div className="cart-summary-left">
            <label className="cart-checkbox">
              <input
                type="checkbox"
                checked={selected.length === items.length && items.length > 0}
                onChange={toggleAll}
              />
              <span>Semua</span>
            </label>
            <p className="cart-summary-total">
              {formatCurrency(selectedTotal || total)}
            </p>
          </div>
          <button
            className="btn btn-dark"
            onClick={() => {
              localStorage.setItem(
                "selected_items",
                JSON.stringify(selectedItems),
              );
              router.push("/checkout");
            }}
            disabled={selected.length === 0}>
            Checkout ({selected.length})
          </button>
        </div>
      </div>

      {/* Summary Desktop */}
      <div className="cart-summary-desktop">
        <div className="cart-summary-row">
          <span>Total</span>
          <span className="cart-summary-total">
            {formatCurrency(selectedTotal || total)}
          </span>
        </div>
        <button
          className="btn btn-dark btn-block"
          onClick={() => {
            localStorage.setItem(
              "selected_items",
              JSON.stringify(selectedItems),
            );
            router.push("/checkout");
          }}
          disabled={selected.length === 0}>
          Checkout ({selected.length})
        </button>
      </div>
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />
    </Layout>
  );
}
