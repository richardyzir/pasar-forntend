import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { useAuth } from "./useAuth";

export function useOrderCount() {
  const [count, setCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const { get } = useApi();

  useEffect(() => {
    if (!isAuthenticated) return;
    loadCount();
  }, [isAuthenticated]);

  const loadCount = async () => {
    try {
      // Ambil halaman 1 dengan per_page besar buat hitung total
      const data = await get("/orders", { per_page: 100 });
      const total = data?.total || 0;
      const active = total; // Atau filter sesuai kebutuhan
      setCount(active > 99 ? "99+" : active);
    } catch (e) {}
  };

  return count;
}
