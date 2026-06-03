import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Alert from "../components/common/Alert";
import { useApi } from "../hooks/useApi";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/format";
import { PAYMENT_METHODS } from "../utils/constants";
import SuccessModal from "../components/common/SuccessModal";
import AlertModal from "../components/common/AlertModal";
import ProductModal from "../components/product/ProductModal";
import api from "../utils/api"; // Tambahkan ini

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const { loading, error, post } = useApi();

  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // ✅ Tambahkan ini
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // ✅ Hanya 1 syncPrices
  const syncPrices = async () => {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const { data } = await api.get(`/products/${item.id}`);
          return { ...item, price: data.price };
        } catch {
          return item;
        }
      }),
    );
    setItems(updatedItems);
    localStorage.setItem("selected_items", JSON.stringify(updatedItems));
  };

  // ✅ Load items dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selected_items");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setItems(parsed);
        setIsLoaded(true);
      } else {
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }
  }, []);

  // ✅ Sync harga setelah items loaded
  useEffect(() => {
    if (items.length > 0 && isLoaded) {
      syncPrices();
    }
  }, [items.length, isLoaded]);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal = total;

  if (!isLoaded) {
    return (
      <Layout>
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      </Layout>
    );
  }
  // Helper tanggal
  const getDateLabel = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const day = date.toLocaleDateString("id-ID", { weekday: "short" });
    const tgl = date.getDate();
    const month = date.toLocaleDateString("id-ID", { month: "short" });
    if (offset === 0) return `Hari ini (${day}, ${tgl} ${month})`;
    if (offset === 1) return `Besok (${day}, ${tgl} ${month})`;
    return `${day}, ${tgl} ${month}`;
  };

  const isSlotAvailable = (offset, type) => {
    if (offset > 0) return true; // Besok & Lusa selalu tersedia

    // Hari ini (offset = 0)
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (type === "pagi") {
      return hours < 10 || (hours === 10 && minutes < 30);
    }
    if (type === "sore") {
      return hours < 17 || (hours === 17 && minutes < 30);
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      setAlertMessage("Alamat pengiriman harus diisi");
      setShowAlert(true);
      return;
    }

    if (!paymentMethod) {
      setAlertMessage("Pilih metode pembayaran");
      setShowAlert(true);
      return;
    }

    // Buka modal konfirmasi
    setShowConfirm(true);
  };

  const handleSubmitOrder = async () => {
    setShowConfirm(false);

    const orderItems = items.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
    }));

    // 🔁 Ubah deliveryTime ke format backend
    let deliveryValue = "";
    if (deliveryTime.startsWith("pagi")) deliveryValue = "pagi";
    else if (deliveryTime.startsWith("sore")) deliveryValue = "sore";
    else if (deliveryTime === "khusus") deliveryValue = "khusus";

    if (!deliveryValue) {
      setAlertMessage("Pilih waktu pengantaran yang valid");
      setShowAlert(true);
      return;
    }

    const payload = {
      items: orderItems,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      delivery_time: deliveryValue, // ✅ "pagi", "sore", "khusus"
      delivery_note: deliveryTime === "khusus" ? deliveryNote : null,
      notes,
    };

    try {
      const data = await post("/orders", payload);
      if (data.order) {
        setLastOrder(data.order);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Error:", err.response?.data);
      setAlertMessage(err.response?.data?.error || "Gagal membuat pesanan");
      setShowAlert(true);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);

    const remainingItems = cartItems.filter(
      (cartItem) =>
        !items.find((selectedItem) => selectedItem.id === cartItem.id),
    );

    localStorage.setItem("pasar_cart", JSON.stringify(remainingItems));

    localStorage.removeItem("selected_items");

    if (lastOrder) {
      router.push(`/payment/${lastOrder.id}`);
    } else {
      router.push("/orders");
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <p style={{ color: "#71717a" }}>Keranjang kosong, mengalihkan...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1
        className="text-3xl font-bold mb-6"
        style={{ marginTop: 50, color: "var(--text)" }}>
        Checkout
      </h1>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">
          <div>
            <div className="card p-4 mb-4">
              <h3 className="font-bold text-lg mb-3">Alamat Pengiriman</h3>
              <Input
                type="textarea"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>

            <div className="card p-4 mb-4">
              <h3 className="font-bold text-lg mb-3">🚚 Waktu Pengantaran</h3>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Hari ini", offset: 0 },
                  { label: "Besok", offset: 1 },
                  { label: "Lusa", offset: 2 },
                ].map(({ label, offset }) => {
                  const date = new Date();
                  date.setDate(date.getDate() + offset);
                  const tanggal = date.toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <div
                      key={offset}
                      style={{
                        display: "flex",
                        alignItems: "stretch",
                        gap: 12,
                        flexWrap: "wrap",
                      }}>
                      {/* Shape Tanggal */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 110,
                          padding: "12px 10px",
                          background: "var(--bg-card-alt)",
                          borderRadius: 10,
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: "1rem",
                            color: "var(--text-secondary)",
                          }}>
                          {tanggal}
                        </div>
                      </div>

                      {/* Shape Jam */}
                      <div
                        style={{
                          flex: 2,
                          display: "flex",
                          gap: 20,
                          flexWrap: "wrap",
                          padding: "12px 16px",
                          background: "var(--bg-card-alt)",
                          borderRadius: 10,
                          alignItems: "center",
                        }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            opacity: isSlotAvailable(offset, "pagi") ? 1 : 0.5,
                            cursor: isSlotAvailable(offset, "pagi")
                              ? "pointer"
                              : "not-allowed",
                          }}>
                          <input
                            type="radio"
                            name="delivery"
                            value={`pagi_${offset}`}
                            checked={deliveryTime === `pagi_${offset}`}
                            onChange={() => setDeliveryTime(`pagi_${offset}`)}
                            disabled={!isSlotAvailable(offset, "pagi")}
                          />
                          <span>🌅 Pagi</span>
                          <span
                            style={{
                              fontSize: "1rem",
                              color: "var(--text-secondary)",
                            }}>
                            08:30-10:30
                          </span>
                          {offset === 0 && !isSlotAvailable(offset, "pagi") && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "red",
                                marginLeft: 6,
                              }}>
                              (habis)
                            </span>
                          )}
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            opacity: isSlotAvailable(offset, "sore") ? 1 : 0.5,
                            cursor: isSlotAvailable(offset, "sore")
                              ? "pointer"
                              : "not-allowed",
                          }}>
                          <input
                            type="radio"
                            name="delivery"
                            value={`sore_${offset}`}
                            checked={deliveryTime === `sore_${offset}`}
                            onChange={() => setDeliveryTime(`sore_${offset}`)}
                            disabled={!isSlotAvailable(offset, "sore")}
                          />
                          <span>🌆 Sore</span>
                          <span
                            style={{
                              fontSize: "1rem",
                              color: "var(--text-secondary)",
                            }}>
                            16:00-17:30
                          </span>
                          {offset === 0 && !isSlotAvailable(offset, "sore") && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "red",
                                marginLeft: 6,
                              }}>
                              (habis)
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  );
                })}

                {/* Khusus */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 12,
                    flexWrap: "wrap",
                  }}>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 110,
                      padding: "12px 10px",
                      background: "var(--bg-card-alt)",
                      borderRadius: 10,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}>
                    <div style={{ fontWeight: 700 }}>Khusus</div>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "var(--text-secondary)",
                      }}>
                      tulis waktu
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 2,
                      padding: "12px 16px",
                      background: "var(--bg-card-alt)",
                      borderRadius: 10,
                    }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}>
                      <input
                        type="radio"
                        name="delivery"
                        value="khusus"
                        checked={deliveryTime === "khusus"}
                        onChange={() => setDeliveryTime("khusus")}
                      />
                      <span>📅 Khusus</span>
                    </label>
                    {deliveryTime === "khusus" && (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Besok jam 10 pagi"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        style={{ marginTop: 4 }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4 mb-4">
              <h3 className="font-bold text-lg mb-3">Metode Pembayaran</h3>
              <div className="payment-methods">
                {/* COD */}
                <label
                  className={`payment-method-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <div>
                    <strong>💵 Bayar di Tempat (COD)</strong>
                  </div>
                </label>

                {/* Transfer Bank */}
                <label
                  className={`payment-method-option ${paymentMethod === "bank_transfer" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer" // ← ubah dari "transfer" ke "bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                  />
                  <div>
                    <strong>🏦 Transfer Bank</strong>
                    <span style={{ display: "block", fontSize: "0.7rem" }}>
                      1490015156633 a.n Richard
                    </span>
                  </div>
                </label>

                {/* QRIS */}
                <label
                  className={`payment-method-option ${paymentMethod === "qris" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={paymentMethod === "qris"}
                    onChange={() => setPaymentMethod("qris")}
                  />
                  <div>
                    <strong>📷 QRIS</strong>
                  </div>
                </label>

                {/* Virtual Account */}
                <label
                  className={`payment-method-option ${paymentMethod === "virtual_account" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="virtual_account" // ← ubah dari "va" ke "virtual_account"
                    checked={paymentMethod === "virtual_account"}
                    onChange={() => setPaymentMethod("virtual_account")}
                  />
                  <div>
                    <strong>💳 Virtual Account</strong>
                    <span style={{ display: "block", fontSize: "0.7rem" }}>
                      DANA : 081347759125
                    </span>
                  </div>
                </label>
              </div>

              {/* Tampilkan QRIS jika dipilih */}
              {paymentMethod === "qris" && (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <img
                    src="/qris.png"
                    alt="QRIS"
                    style={{ width: 200, height: "auto" }}
                  />
                </div>
              )}
            </div>

            <div className="card p-4">
              <h3 className="font-bold text-lg mb-3">Catatan (Opsional)</h3>
              <Input
                type="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan untuk penjual..."
              />
            </div>
          </div>

          <div>
            <div className="order-summary">
              <div className="card p-4">
                <h3 className="font-bold text-sm mb-2">Pesanan Anda</h3>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs mb-1">
                    <span>
                      {item.name} x{item.qty}
                    </span>
                    <span>{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}

                {/* <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "var(--text-secondary)" }}>
                  <span>Biaya Admin + Packing + kurir</span>
                  <span>+Rp 10.000</span>
                </div> */}
                <div
                  className="flex justify-between font-bold border-t pt-2 mt-2"
                  style={{ fontSize: "0.95rem" }}>
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
            </div>
            {/*  */}
            <Button
              type="submit"
              variant="red"
              block
              className="mt-4"
              loading={loading}
              style={{
                border: "1px solid",
                color: "red",
              }}>
              Buat Pesanan
            </Button>
            <button
              className="btn btn-dark btn-block"
              style={{ marginTop: 16 }}
              onClick={() => router.push("/cart")}>
              ← Kembali ke Pesanan
            </button>
          </div>
        </div>
      </form>
      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <span style={{ fontSize: "2.5rem" }}>🛒</span>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginTop: 8,
                }}>
                Apakah pesanan Anda sudah cukup untuk hari ini?
              </h3>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  marginTop: 1,
                }}>
                List item yang dipesan:
              </p>
            </div>

            <div style={{ marginBottom: 16, maxHeight: 200, overflow: "auto" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    fontSize: "0.8rem",
                    color: "var(--text)",
                    borderBottom: "1px solid var(--border)",
                  }}>
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--text)",
                }}>
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#dc2626",
                marginTop: 1,
                marginBottom: 12,
                textAlign: "center",
                padding: "0 20px",
              }}>
              ⚠️ Penambahan item disini tidak dapat dihapus
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => setShowConfirm(false)}>
                ← Kembali
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowConfirm(false);
                  setShowProductModal(true);
                }}>
                + Tambah Item
              </button>
              <button
                className="btn btn-dark"
                style={{ flex: 1 }}
                onClick={handleSubmitOrder}>
                Pesan ✅
              </button>
            </div>
          </div>
        </div>
      )}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          // Reload items dari selected_items
          const saved = localStorage.getItem("selected_items");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) {
              setItems(parsed);
            }
          }
        }}
      />
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Perhatian"
        message={alertMessage}
        type="warning"
      />
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleCloseSuccess}
        orderNumber={lastOrder?.order_number}
        amount={lastOrder?.total_amount}
      />
    </Layout>
  );
}
