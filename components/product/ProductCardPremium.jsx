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
        <p className="product-price">{formatCurrency(product.price)}</p>

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
