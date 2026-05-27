import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Alert from "../components/common/Alert";

export default function Register() {
  const router = useRouter();
  const { registerSendOtp, registerVerify } = useAuth();

  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    password_confirmation: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const startCountdown = () => {
    setCountdown(120);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Kirim OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    // alert("Kirim OTP diklik!");
    setError("");
    setLoading(true);

    try {
      const data = await registerSendOtp(form);
      setSuccess(data.message);
      setStep("otp");
      startCountdown();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || "Gagal mengirim OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verifikasi OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerVerify(form.phone, otp);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Verifikasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {step === "form" ? "📝 Daftar Akun" : "📱 Verifikasi OTP"}
        </h1>
        <p className="auth-subtitle">
          {step === "form"
            ? "Isi data diri untuk mendaftar"
            : `Masukkan kode OTP yang dikirim ke ${form.phone}`}
        </p>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
        )}

        {step === "form" ? (
          <form onSubmit={handleSendOtp}>
            <Input
              label="Nama Lengkap"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Username"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Email (opsional)"
              required
            />
            <Input
              label="Nomor Telepon"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="0812xxxxx"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              label="Konfirmasi Password"
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
            <Input
              label="Alamat Lengkap"
              type="textarea"
              name="address"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
              required
            />
            <Button type="submit" block loading={loading}>
              Kirim Kode OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                className="form-input otp-input"
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
              {countdown > 0 && (
                <p className="text-sm text-center mt-2">
                  ⏱{" "}
                  <strong className="text-danger">
                    {formatTime(countdown)}
                  </strong>
                </p>
              )}
            </div>
            <Button
              type="submit"
              block
              loading={loading}
              disabled={otp.length !== 6}>
              Verifikasi & Daftar
            </Button>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-sm text-gray text-center mt-3 hover:underline">
              ← Ubah data
            </button>
          </form>
        )}

        <div className="auth-footer">
          Sudah punya akun? <Link href="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
