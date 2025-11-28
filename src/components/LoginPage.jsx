import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // For now this is a visual login only.
    // Later we can connect Firebase Auth here.
    alert(
      "Encore Studio prototype login.\n\nThis screen is ready for Firebase authentication when you want to wire it."
    );
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: 20,
        borderRadius: 18,
        border: "1px solid rgba(55,65,81,0.9)",
        background:
          "radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 60%) rgba(15,23,42,0.98)",
        boxShadow: "0 20px 40px rgba(15,23,42,0.85)",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: 20 }}>Sign in</h2>
      <p style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
        Private access for hosts and producers. In the live version this will
        be backed by secure authentication.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, marginTop: 14 }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <label style={{ fontSize: 12 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(55,65,81,0.9)",
              background: "rgba(15,23,42,1)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 4 }}>
          <label style={{ fontSize: 12 }}>Password</label>
          <input
            type="password"
            required
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(55,65,81,0.9)",
              background: "rgba(15,23,42,1)",
              color: "#e5e7eb",
              fontSize: 13,
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: 6,
            padding: "9px 12px",
            borderRadius: 999,
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            background:
              "linear-gradient(to right, #1d4ed8, #2563eb, #38bdf8)",
            color: "#e5e7eb",
          }}
        >
          Sign in
        </button>

        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
          By continuing you agree that this environment is for{" "}
          <b>private production use only</b>. Credentials can be managed when
          we hook in Firebase Auth.
        </div>
      </form>
    </div>
  );
}
