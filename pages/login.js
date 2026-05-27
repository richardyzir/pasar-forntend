import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "../utils/api";

export default function Login() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { login, password });

      if (data.success && !data.require_otp) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin" || data.user.role === "master") {
          window.location.href = "/admin/dashboard";
        } else if (data.user.role === "kurir") {
          window.location.href = "/kurir/dashboard";
        } else {
          window.location.href = "/";
        }
      } else if (data.require_otp) {
        setError("OTP: " + data.debug_token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">🔑 Login</h1>
        <p className="auth-subtitle">Masuk ke akun Anda</p>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setError("")} className="alert-close">
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username / Email / No. HP</label>
            <input
              type="text"
              className="form-input"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Username, Email, atau No. HP"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}>
            {loading ? <span className="spinner" /> : "Masuk"}
          </button>

          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={() => router.push("/")}>
              Kembali ke Beranda
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Belum punya akun? <Link href="/register">Daftarr di sini</Link>
        </div>
      </div>
    </div>
  );
}
