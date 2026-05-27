import ProductCard from "./ProductCard";

export default function ProductList({ products, onAddToCart }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray text-lg">Tidak ada produk ditemukan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart(product)}
        />
      ))}
    </div>
  );
}
