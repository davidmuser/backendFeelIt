import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentEmail } from "../utils/moodStorage";

async function signInWithServer(email, password) {
  void email;
  void password;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call POST /login on the backend to validate credentials and return auth data.
    await signInWithServer(email, password);
    setCurrentEmail(email);
    navigate("/home");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Sign In Page</h2>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
