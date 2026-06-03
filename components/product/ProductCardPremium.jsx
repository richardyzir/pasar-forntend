import { formatCurrency } from "../../utils/format";
import { useRouter } from "next/router";

export default function ProductCardPremium({ product, onAddToCart }) {
  const router = useRouter();

  const hasDiscount = product.original_price > product.price;

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="product-card">
      <div className="product-card-image" style={{ fontSize: "3.5rem" }}>
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

      <div className="product-info">
        <p className="product-category">{product.category || "Umum"}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-unit">per {product.unit || "pack"}</p>

        {/* Harga coret (original_price) */}
        {hasDiscount && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
            }}>
            <span
              style={{
                fontSize: "0.7rem",
                textDecoration: "line-through",
                color: "var(--text-muted)",
              }}>
              {formatCurrency(product.original_price)}
            </span>
            <span className="badge badge-danger" style={{ fontSize: "0.6rem" }}>
              {product.discount_type === "percentage"
                ? `${product.discount}%`
                : `-${formatCurrency(product.discount)}`}
            </span>
          </div>
        )}

        {/* Harga akhir (setelah diskon) */}
        <p
          className="product-price"
          style={{ fontSize: "1rem", fontWeight: 700 }}>
          {formatCurrency(product.price)}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className="btn btn-dark btn-sm btn-block">
          {product.stock === 0 ? "Habis" : "+ Keranjang"}
        </button>
      </div>
    </div>
  );
}
