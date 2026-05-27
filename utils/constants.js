export const ORDER_STATUS_MAP = {
  pending_payment: "Menunggu Bayar",
  paid: "Dibayar",
  processing: "Diproses",
  shipping: "Dikirim",
  delivered: "Terkirim",
  cancelled: "Dibatalkan",
  expired: "Kadaluarsa",
};

export const PAYMENT_METHOD_MAP = {
  cod: "COD (Bayar di Tempat)",
  bank_transfer: "Transfer Bank",
  virtual_account: "Virtual Account",
  qris: "QRIS",
};

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "🏦 Transfer Bank" },
  { value: "virtual_account", label: "📱 Virtual Account" },
  { value: "qris", label: "📷 QRIS" },
  { value: "cod", label: "💵 COD (Bayar di Tempat)" },
];
