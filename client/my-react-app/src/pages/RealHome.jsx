import React from "react";
import { useNavigate } from "react-router-dom";

const options = [
  { label: "Profile", description: "View and edit your profile." },
  {
    label: "Activity / Games",
    description: "See today’s activity and play uplifting games.",
  },
  { label: "Messages", description: "Read and send messages." },
  { label: "Friends", description: "Manage your friends list." },
  {
    label: "Talk to a Professional",
    description: "Connect with a counselor or coach.",
    route: "/talk-to-professional",
  },
  {
    label: "Call / Video Call",
    description: "Start a voice or video conversation.",
  },
];

export default function RealHome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3rem 1rem",
        background: "#f3f7ff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "980px",
          background: "white",
          borderRadius: "26px",
          boxShadow: "0 26px 70px rgba(15, 23, 42, 0.12)",
          padding: "2.5rem",
          border: "1px solid #dbeafe",
        }}
      >
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "3rem", color: "#0f172a" }}>
            Your Home
          </h1>
          <p
            style={{
              margin: "1rem auto 0",
              maxWidth: "680px",
              color: "#475569",
              fontSize: "1.05rem",
            }}
          >
            Choose one of the options below to explore your profile, activity,
            messaging, friends, professional support, and calls.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {options.map((option) => (
            <div
              key={option.label}
              style={{
                background: "#eff6ff",
                padding: "1.5rem",
                borderRadius: "22px",
                border: "1px solid #bfdbfe",
                minHeight: "170px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{ margin: 0, fontSize: "1.35rem", color: "#0f172a" }}
                >
                  {option.label}
                </h2>
                <p
                  style={{
                    margin: "0.75rem 0 0",
                    color: "#475569",
                    lineHeight: 1.7,
                  }}
                >
                  {option.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (option.route) {
                    navigate(option.route);
                    return;
                  }
                  alert(`${option.label} page coming soon!`);
                }}
                style={{
                  marginTop: "1.25rem",
                  border: "none",
                  borderRadius: "14px",
                  padding: "0.95rem 1rem",
                  fontSize: "1rem",
                  background: "#4C7EE1",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Open
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => navigate("/home")}
            style={{
              background: "#e2e8f0",
              color: "#0f172a",
              border: "none",
              borderRadius: "14px",
              padding: "0.95rem 1.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Back to Journey
          </button>
        </div>
      </div>
    </div>
  );
}
