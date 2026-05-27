import Link from "next/link";
import { formatCurrency } from "../../utils/format";
import Button from "../common/Button";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="product-image"
        />
      </Link>
      <div className="product-info">
        <h3 className="product-name">
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-category">{product.category || "Umum"}</p>
        <p className="product-price">{formatCurrency(product.price)}</p>
        <p className="product-stock mb-3">Stok: {product.stock}</p>

        <Button
          variant="primary"
          size="sm"
          block
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}>
          {product.stock === 0 ? "Stok Habis" : "🛒 Tambah ke Keranjang"}
        </Button>
      </div>
    </div>
  );
}
