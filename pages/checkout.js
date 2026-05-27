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

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();

  const { items: cartItems, clearCart } = useCart();
  const [items, setItems] = useState([]);
  const { loading, error, post } = useApi();
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  // const adminFee = 10000;
  const finalTotal = total;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const [deliveryNote, setDeliveryNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selected_items");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        setItems(parsed);
      } else {
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }
  }, []);

  const [isLoaded, setIsLoaded] = useState(false);

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

  if (!isLoaded) {
    return (
      <Layout>
        <div className="loading-page">
          <span className="spinner spinner-lg" />
        </div>
      </Layout>
    );
  }

  // Pagi: 08:30 - 10:30
  const isMorningAvailable =
    currentHour < 10 || (currentHour === 10 && currentMinute < 30);

  // Sore: 16:00 - 17:30
  const isAfternoonAvailable =
    currentHour < 17 || (currentHour === 17 && currentMinute < 30);

  const isKhusus = true;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deliveryTime) {
      setAlertMessage("Pilih waktu pengantaran terlebih dahulu");
      setShowAlert(true);
      return;
    }

    if (deliveryTime === "pagi" && !isMorningAvailable) {
      setAlertMessage("Waktu pengantaran pagi sudah tidak tersedia");
      setShowAlert(true);
      return;
    }

    if (deliveryTime === "khusus" && !deliveryNote) {
      setAlertMessage("Tulis waktu pengantaran yang diinginkan");
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

    try {
      const data = await post("/orders", {
        items: orderItems,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        delivery_time: deliveryTime,
        delivery_note: deliveryTime === "khusus" ? deliveryNote : null,
        // admin_fee: adminFee,
        notes,
      });

      if (data.order) {
        setLastOrder(data.order);
        setShowSuccess(true);
      }
    } catch (err) {}
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);

    // Hapus hanya item yang dipilih dari cart
    const remainingItems = cartItems.filter(
      (cartItem) =>
        !items.find((selectedItem) => selectedItem.id === cartItem.id),
    );

    // Update localStorage cart
    localStorage.setItem("pasar_cart", JSON.stringify(remainingItems));

    // Hapus selected_items
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

              {/* Pagi */}
              <label
                className={`delivery-option ${deliveryTime === "pagi" ? "selected" : ""} ${!isMorningAvailable ? "disabled" : ""}`}>
                <input
                  type="radio"
                  name="delivery"
                  value="pagi"
                  checked={deliveryTime === "pagi"}
                  onChange={(e) => {
                    setDeliveryTime(e.target.value);
                    setFormError("");
                  }}
                  disabled={!isMorningAvailable}
                />
                <div>
                  <p className="font-semibold">
                    🌅 Pagi {!isMorningAvailable && "(Tidak Tersedia)"}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}>
                    08:30 - 10:30
                  </p>
                </div>
              </label>

              {/* Sore */}
              <label
                className={`delivery-option ${deliveryTime === "sore" ? "selected" : ""} ${!isAfternoonAvailable ? "disabled" : ""}`}>
                <input
                  type="radio"
                  name="delivery"
                  value="sore"
                  checked={deliveryTime === "sore"}
                  onChange={(e) => {
                    setDeliveryTime(e.target.value);
                    setFormError("");
                  }}
                  disabled={!isAfternoonAvailable}
                />
                <div>
                  <p className="font-semibold">
                    🌆 Sore {!isAfternoonAvailable && "(Tidak Tersedia)"}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}>
                    16:00 - 17:30
                  </p>
                </div>
              </label>

              {/* Khusus */}
              <label
                className={`delivery-option ${deliveryTime === "khusus" ? "selected" : ""}`}
                style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                  }}>
                  <input
                    type="radio"
                    name="delivery"
                    value="khusus"
                    checked={deliveryTime === "khusus"}
                    onChange={(e) => {
                      setDeliveryTime(e.target.value);
                      setFormError("");
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p className="font-semibold">📅 Pesanan (Khusus)</p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}>
                      Tulis waktu pengantaran yang diinginkan
                    </p>
                  </div>
                </div>

                {deliveryTime === "khusus" && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Besok jam 10 pagi, Sabtu jam 2 siang..."
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    style={{ marginTop: 10, width: "100%" }}
                  />
                )}
              </label>

              {formError && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#dc2626",
                    marginTop: 8,
                  }}>
                  ⚠ {formError}
                </p>
              )}
            </div>

            <div className="card p-4 mb-4">
              <h3 className="font-bold text-lg mb-3">Metode Pembayaran</h3>
              <div className="payment-methods">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`payment-method-option ${paymentMethod === method.value ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    {method.label}
                  </label>
                ))}
              </div>
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
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginTop: 4,
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
                style={{ flex: 2 }}
                onClick={handleSubmitOrder}>
                Lanjutkan ✅
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
