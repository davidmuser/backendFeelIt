// Login.jsx
// This is the login page. Students should implement a form with username/email and password fields.
// On successful login, navigate to the home page.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // State for password field
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement login logic here
    // On success, navigate to home page
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Login Page</h2>
      {/* TODO: Add a password field to the form */}
      <h3 style={{ color: "gray", fontWeight: "normal" }}>
        {/* Add password input here */}
        {/* Example: <input type="password" ... /> */}
        {/* Login form with email and password fields */}
      </h3>
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
