import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentEmail } from "../utils/moodStorage";
import { saveUser } from "../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }
      saveUser(data.user);
      setCurrentEmail(email);
      navigate(data.user.isProfessional ? "/pro-dashboard" : "/home");
    } catch {
      setError("Could not connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Sign In Page</h2>
      {error && (
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
      )}
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
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
