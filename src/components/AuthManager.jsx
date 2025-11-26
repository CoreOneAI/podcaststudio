import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function AuthManager() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setStatus(user ? "signed-in" : "signed-out");
    });
    return () => unsub();
  }, []);

  return (
    <div
      style={{
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
        backdropFilter: "blur(6px)",
      }}
      aria-live="polite"
    >
      Auth: <b>{status}</b>
    </div>
  );
}
