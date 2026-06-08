import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentEmail } from "../utils/moodStorage";
import { saveUser } from "../utils/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isProfessional, setIsProfessional] = useState(false);
  const [professionalRole, setProfessionalRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          isProfessional,
          professionalRole,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Registration failed");
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
      <h2>Sign Up Page</h2>
      {error && (
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "inline-block",
          textAlign: "left",
          minWidth: "280px",
        }}
      >
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <div style={{ margin: "0.75rem 0" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={isProfessional}
              onChange={(e) => setIsProfessional(e.target.checked)}
            />
            Register as a mental health professional
          </label>
        </div>
        {isProfessional && (
          <div>
            <label>Professional role / title:</label>
            <input
              type="text"
              value={professionalRole}
              onChange={(e) => setProfessionalRole(e.target.value)}
              placeholder="e.g. Licensed Therapist"
            />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
}
