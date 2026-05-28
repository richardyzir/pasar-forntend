import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import Toast from "../components/common/Toast";
import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter(); // ← HARUS DI SINI
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const end = () => setLoading(false);

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
    };
  }, [router]);

  // Theme init
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    const root = document.documentElement;
    if (saved === "dark") root.classList.add("dark");
    else if (saved === "light") root.classList.add("light");
    else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, []);

  return (
    <AuthProvider>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=yes"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Fofi Mart" />
        <link rel="apple-touch-icon" href="/fofimartbg192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/fofimartbg192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/fofimartbg512.png"
        />

        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Fofi Mart" />
        <link rel="apple-touch-icon" href="/fofimart192.png" />
        <link rel="apple-touch-startup-image" href="/fofimart512.png" />

        <title>Fofi Mart</title>
      </Head>

      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 3,
            background: "var(--primary)",
            animation: "loadingBar 0.4s ease",
          }}
        />
      )}

      <div
        style={{
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.2s ease",
          filter: loading ? "blur(1px)" : "none",
        }}>
        <Component {...pageProps} />
      </div>

      <Toast />
    </AuthProvider>
  );
}
<script
  dangerouslySetInnerHTML={{
    __html: `
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  `,
  }}
/>;

export default MyApp;
