import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#101827",
        padding: "2rem",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#111e3e",
          borderRadius: 24,
          padding: "2.5rem",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "0.65rem 1rem",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Back
        </button>

        <h1 style={{ fontSize: "2.6rem", marginBottom: "0.75rem", textAlign: "center" }}>
          Welcome Back
        </h1>
        <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "2rem" }}>
          You're back — sign in and continue where you left off.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.5rem", color: "#cbd5e1" }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.95rem 1rem",
                borderRadius: 16,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: "0.5rem", color: "#cbd5e1" }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.95rem 1rem",
                borderRadius: 16,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "1rem 1.2rem",
              borderRadius: 16,
              border: "none",
              background: "#22c55e",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
