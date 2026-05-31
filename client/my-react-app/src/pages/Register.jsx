import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentEmail } from "../utils/moodStorage";

async function registerWithServer(email, password) {
  const response = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Registration failed.");
  }

  return response.json();
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call POST /register on the backend to create a user in the users collection.
    await registerWithServer(email, password);
    setCurrentEmail(email);
    navigate("/home");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Sign Up Page</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "inline-block", textAlign: "left" }}
      >
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
