import { formatCurrency } from "../../utils/format";
import { useRouter } from "next/router";

export default function ProductCardPremium({ product, onAddToCart }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="product-card">
      {/* Image */}
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

      {/* Info */}
      <div className="product-info">
        <p className="product-category">{product.category || "Umum"}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-unit">per {product.unit || "pack"}</p>
        {product.discount > 0 && (
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
              {formatCurrency(product.price)}
            </span>
            <span className="badge badge-danger" style={{ fontSize: "0.6rem" }}>
              {product.discount_type === "percentage"
                ? `${product.discount}%`
                : `-Rp ${Number(product.discount).toLocaleString("id")}`}
            </span>
          </div>
        )}
        <p className="product-price">
          {formatCurrency(product.final_price ?? product.price)}
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
