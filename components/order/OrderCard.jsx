import Link from "next/link";
import { formatCurrency, formatDate } from "../../utils/format";
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from "../../utils/constants";

export default function OrderCard({ order }) {
  const statusClass = {
    pending_payment: "badge-warning",
    paid: "badge-primary",
    processing: "badge-primary",
    shipping: "badge-warning",
    delivered: "badge-success",
    cancelled: "badge-danger",
    expired: "badge-gray",
  };

  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <p className="order-number">#{order.order_number}</p>
          <p className="order-date">{formatDate(order.created_at)}</p>
        </div>
        <span className={`badge ${statusClass[order.status] || "badge-gray"}`}>
          {ORDER_STATUS_MAP[order.status] || order.status}
        </span>
      </div>

      <div className="mb-3">
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm mb-1">
            <span>
              {item.product?.name} x{item.quantity}
            </span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t">
        <div>
          <p className="text-sm text-gray">
            {PAYMENT_METHOD_MAP[order.payment_method]}
          </p>
          <p className="order-total">{formatCurrency(order.total_amount)}</p>
        </div>
        <Link href={`/orders/${order.id}`} className="btn btn-outline btn-sm">
          Detail
        </Link>
      </div>
    </div>
  );
}
