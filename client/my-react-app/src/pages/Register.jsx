import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement registration logic here
    // On success, navigate to user home page
    navigate("/home");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Sign Up Page</h2>
      {/* TODO: Implement register form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "inline-block", textAlign: "left" }}
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
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: 24,
          padding: "2.5rem",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.35)",
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
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.75rem", textAlign: "center" }}>
          Create Account
        </h1>
        <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "1rem" }}>
          Register to get started.
        </p>
        <p style={{ color: "#cbd5e1", textAlign: "center", marginBottom: "2rem", lineHeight: 1.6 }}>
          FeelIt is a safe space for people who want moral support, connection, and a place to share how they feel. Create an account to join the community and feel heard.
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
                padding: "0.9rem 1rem",
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
                padding: "0.9rem 1rem",
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
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
