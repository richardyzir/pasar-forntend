import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (login, password) => {
    const { data } = await api.post("/auth/login", { login, password });
    if (data.success && !data.require_otp) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const registerSendOtp = async (formData) => {
    const { data } = await api.post("/auth/register/send-otp", formData);
    return data;
  };

  const registerVerify = async (phone, otp) => {
    const { data } = await api.post("/auth/register/verify", { phone, otp });
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pasar_cart");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerSendOtp,
        registerVerify,
        logout,
        isAuthenticated: !!user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
