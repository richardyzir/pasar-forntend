import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (mode) => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (mode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", prefersDark);
      root.classList.toggle("light", !prefersDark);
    }
  };

  const setMode = (mode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    applyTheme(mode);
  };

  const toggle = () => {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setMode(next);
  };

  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻";

  return { theme, icon, toggle, setMode };
}
