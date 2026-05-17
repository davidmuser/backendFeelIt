import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserHome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f9ff",
        color: "#0f172a",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
          padding: "3rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "3rem" }}>Welcome Back!</h1>
        <p style={{ margin: "1.5rem 0", fontSize: "1.1rem", lineHeight: 1.6 }}>
          You are now signed in. This is your home page after logging in.
          When you sign out, you will return to the landing page.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              minWidth: "140px",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid #94a3b8",
              background: "white",
              color: "#0f172a",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Sign Out
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              minWidth: "140px",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#4C7EE1",
              color: "white",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Account Settings
          </button>
        </div>
      </div>
    </div>
  );
}
