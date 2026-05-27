import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../../utils/api";
import { useTheme } from "../../hooks/useTheme";
import AdminLayout from "../../components/layout/AdminLayout";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(null);
  const { theme, icon, toggle } = useTheme();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (!u.role || (u.role !== "admin" && u.role !== "master")) {
      router.push("/admin/login");
      return;
    }
    setUser(u);
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data } = await api.get("/admin/dashboard");
    setStats(data);
  };

  return (
    <AdminLayout title="Dashboard">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}>
        ...
      </div>
    </AdminLayout>
  );
}
