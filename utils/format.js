// Format Rupiah
export const formatCurrency = (amount) => {
  if (!amount) return "Rp 0";
  return "Rp " + Number(amount).toLocaleString("id-ID");
};

// Format tanggal
export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format timer (detik ke mm:ss)
export const formatTime = (seconds) => {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Mask nomor telepon
export const maskPhone = (phone) => {
  if (!phone) return "";
  const len = phone.length;
  if (len <= 4) return phone;
  return phone.substring(0, 4) + "****" + phone.substring(len - 3);
};

// Truncate text
export const truncate = (text, max = 50) => {
  if (!text || text.length <= max) return text;
  return text.substring(0, max) + "...";
};

// Format angka dengan titik (10000 → 10.000)
export const formatNumber = (num) => {
  if (!num && num !== 0) return "";
  return Number(num).toLocaleString("id-ID");
};

// Hapus titik dari string (10.000 → 10000)
export const unformatNumber = (str) => {
  if (!str) return 0;
  return Number(String(str).replace(/\./g, ""));
};
