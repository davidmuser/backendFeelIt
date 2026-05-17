// MyButton.jsx
// This component renders the Login and Register buttons on the landing page.
// Students should implement navigation to the Login and Register pages when the buttons are clicked.
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyButton() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        marginTop: "2rem",
      }}
    >
      {/* TODO: Implement navigation to /login and /register */}
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/register")}>Register</button>
    </div>
  );
}
