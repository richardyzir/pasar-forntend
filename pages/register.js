import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Alert from "../components/common/Alert";
import SearchSelect from "../components/common/SearchSelect";

export default function Register() {
  const router = useRouter();
  const { registerSendOtp } = useAuth();

  const [selectedKota, setSelectedKota] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");
  const [alamatJalan, setAlamatJalan] = useState("");
  const [dataAlamat, setDataAlamat] = useState({});

  const [step, setStep] = useState("form");
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch("/data/alamat.json")
      .then((res) => res.json())
      .then((data) => setDataAlamat(data));
  }, []);

  const kotaList = Object.keys(dataAlamat);
  const kecamatanList = selectedKota
    ? Object.keys(dataAlamat[selectedKota])
    : [];
  const kelurahanList =
    selectedKecamatan && selectedKota
      ? dataAlamat[selectedKota][selectedKecamatan]
      : [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setLoading(true);

    const fullAddress = `${selectedKelurahan}, ${selectedKecamatan}, ${selectedKota} - ${alamatJalan}`;
    const finalForm = { ...form, address: fullAddress };

    try {
      const data = await registerSendOtp(finalForm);
      if (data.success) {
        setSuccess(data.message || "Registrasi berhasil!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || "Gagal mendaftar");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">📝 Daftar Akun</h1>
        <p className="auth-subtitle">Isi data diri untuk mendaftar</p>

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

        {success ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <span style={{ fontSize: "3rem" }}>✅</span>
            <p style={{ fontSize: "1rem", fontWeight: 700, marginTop: 12 }}>
              Pendaftaran Berhasil!
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                marginTop: 4,
              }}>
              Anda akan dialihkan ke halaman login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <Input
              label="Nama Lengkap *"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <Input
              label="Username *"
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
            />
            <Input
              label="Nomor Telepon *"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="0812xxxxx"
              required
            />
            <Input
              label="Password *"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              label="Konfirmasi Password *"
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />

            <SearchSelect
              label="Kota"
              options={kotaList}
              value={selectedKota}
              onChange={(value) => {
                setSelectedKota(value);
                setSelectedKecamatan("");
                setSelectedKelurahan("");
              }}
              placeholder="Cari kota..."
            />
            <SearchSelect
              label="Kecamatan"
              options={kecamatanList}
              value={selectedKecamatan}
              onChange={(value) => {
                setSelectedKecamatan(value);
                setSelectedKelurahan("");
              }}
              placeholder="Cari kecamatan..."
              disabled={!selectedKota}
            />
            <SearchSelect
              label="Kelurahan"
              options={kelurahanList}
              value={selectedKelurahan}
              onChange={setSelectedKelurahan}
              placeholder="Cari kelurahan..."
              disabled={!selectedKecamatan}
            />

            <Input
              label="Alamat Jalan (Rt/Rw, No Rumah, dll) *"
              type="textarea"
              name="address_detail"
              value={alamatJalan}
              onChange={(e) => setAlamatJalan(e.target.value)}
              required
            />

            <Button type="submit" block loading={loading}>
              Daftar
            </Button>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => router.push("/")}>
                Kembali ke Beranda
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          Sudah punya akun? <Link href="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
