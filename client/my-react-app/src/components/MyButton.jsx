import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyButton() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        marginTop: "2rem",
      }}
    >
      <button
        onClick={() => navigate("/login")}
        style={{
          width: "200px",
          height: "50px",
          fontSize: "18px",
          padding: "10px 20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#ffffff",
          color: "#000000",
          cursor: "pointer",
          transition: "background-color 0.3s, border-color 0.3s",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#f7f7f7";
          e.target.style.borderColor = "#999";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#ffffff";
          e.target.style.borderColor = "#ccc";
        }}
      >
        Sign In
      </button>
      <button
        onClick={() => navigate("/register")}
        style={{
          width: "200px",
          height: "50px",
          fontSize: "18px",
          padding: "10px 20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#f0f0f0",
          color: "#000000",
          cursor: "pointer",
          transition: "background-color 0.3s, border-color 0.3s",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#e0e0e0";
          e.target.style.borderColor = "#999";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#f0f0f0";
          e.target.style.borderColor = "#ccc";
        }}
      >
        Sign Up
      </button>
    </div>
  );
}
