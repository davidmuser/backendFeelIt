import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function randPercent() {
  return Math.floor(Math.random() * 80) + 5; // between 5% and 85%
}

export default function Games() {
  const navigate = useNavigate();
  const [left, setLeft] = useState(randPercent());
  const [top, setTop] = useState(randPercent());
  const [score, setScore] = useState(0);

  useEffect(() => {
    // initial tiny bounce
    const id = setInterval(() => {
      setLeft(randPercent());
      setTop(randPercent());
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleClick = () => {
    setScore((s) => s + 1);
    setLeft(randPercent());
    setTop(randPercent());
  };

  const handleReset = () => {
    setScore(0);
    setLeft(randPercent());
    setTop(randPercent());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2.2rem 1rem",
        background: "linear-gradient(180deg, #fff7ed 0%, #f8fafc 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          padding: "1.5rem",
          border: "1px solid #f3e8ff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 style={{ margin: 0 }}>Silly Click Chase</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleReset} style={{ padding: "0.5rem 0.8rem" }}>
              Reset
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ padding: "0.5rem 0.8rem" }}
            >
              Back
            </button>
          </div>
        </div>

        <p style={{ color: "#475569" }}>
          Try to click the moving button — each hit scores a point. Have fun!
        </p>

        <div
          style={{
            position: "relative",
            height: "420px",
            borderRadius: "12px",
            background: "linear-gradient(180deg,#eef2ff,#ffffff)",
            marginTop: "1rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{ position: "absolute", left: "1rem", top: "1rem" }}>
            <strong style={{ fontSize: "1.25rem" }}>Score: {score}</strong>
          </div>

          <button
            onClick={handleClick}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%,-50%)",
              padding: "0.9rem 1.1rem",
              borderRadius: "999px",
              border: "none",
              background: "#f97316",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(249,115,22,0.18)",
            }}
          >
            Catch me!
          </button>
        </div>
      </div>
    </div>
  );
}
