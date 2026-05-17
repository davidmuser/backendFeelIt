import React from "react";
import { Link } from "react-router-dom";

export default function SplashScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          borderRadius: 24,
          padding: "3rem",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.35)",
          background: "#111e3e",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          position: "relative",
        }}
      >
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "3rem", lineHeight: 1.05, marginBottom: "1rem" }}>
            Welcome to FeelIt
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#cbd5e1", maxWidth: 680, margin: "0 auto" }}>
            Sign in or register to continue.
          </p>
        </div>

        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 160,
                padding: "1rem 1.8rem",
                borderRadius: 999,
                background: "#22c55e",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              Sign In
            </Link>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              Already a user? Quick sign in.
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 160,
                padding: "1rem 1.8rem",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                color: "#f8fafc",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.18)",
                fontWeight: 700,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              Register
            </Link>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              New here? Create an account.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
