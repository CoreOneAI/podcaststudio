import React from "react";

// IMPORTANT:
// This component is intentionally defensive.
// It will:
// - avoid hard-crashing if Firebase isn't configured
// - avoid breaking build if Firebase SDK is missing/misconfigured
// - show a small status pill for demos

export default function AuthManager() {
  const [status, setStatus] = React.useState("checking");
  const [detail, setDetail] = React.useState("");

  React.useEffect(() => {
    let unsub = null;
    let cancelled = false;

    async function boot() {
      try {
        // Lazy-load so missing/incorrect firebase setup doesn't white-screen the site.
        const { initializeApp, getApps } = await import("firebase/app");
        const { getAuth, onAuthStateChanged } = await import("firebase/auth");

        // Try to read config from Vite env (Netlify env vars must be prefixed with VITE_)
        const cfg = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
        };

        const required = ["apiKey", "authDomain", "projectId", "appId"];
        const missing = required.filter((k) => !cfg[k]);

        if (missing.length) {
          if (cancelled) return;
          setStatus("disabled");
          setDetail(`Firebase not configured (missing: ${missing.join(", ")})`);
          console.warn("[AuthManager] Firebase disabled:", { missing });
          return;
        }

        const app = getApps().length ? getApps()[0] : initializeApp(cfg);
        const auth = getAuth(app);

        unsub = onAuthStateChanged(
          auth,
          (user) => {
            if (cancelled) return;
            setStatus(user ? "signed-in" : "signed-out");
            setDetail(user ? user.email || user.uid : "");
          },
          (err) => {
            if (cancelled) return;
            setStatus("error");
            setDetail(err?.message || String(err));
            console.error("[AuthManager] onAuthStateChanged error:", err);
          }
        );
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setDetail(err?.message || String(err));
        console.error("[AuthManager] Firebase boot error:", err);
      }
    }

    boot();

    return () => {
      cancelled = true;
      try {
        if (typeof unsub === "function") unsub();
      } catch {
        // ignore
      }
    };
  }, []);

  const pillStyle = {
    position: "fixed",
    right: 12,
    bottom: 12,
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(17,24,39,0.85)",
    border: "1px solid rgba(31,41,55,0.9)",
    color: "#e5e7eb",
    fontSize: 12,
    zIndex: 9999,
    maxWidth: 360,
    backdropFilter: "blur(6px)",
  };

  const label =
    status === "checking"
      ? "Auth: checking…"
      : status === "signed-in"
      ? `Auth: signed in${detail ? ` (${detail})` : ""}`
      : status === "signed-out"
      ? "Auth: signed out"
      : status === "disabled"
      ? "Auth: disabled"
      : "Auth: error";

  return (
    <div style={pillStyle} aria-live="polite" title={detail || ""}>
      <b>{label}</b>
      {detail && status !== "signed-in" ? (
        <div style={{ marginTop: 6, opacity: 0.8, lineHeight: 1.2 }}>{detail}</div>
      ) : null}
    </div>
  );
}
