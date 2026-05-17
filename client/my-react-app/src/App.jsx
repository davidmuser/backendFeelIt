// App.jsx
// This is the main entry point for the app. Students should not need to change this file except to add new routes or wrap the app in providers.
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MyButton from "./components/MyButton";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserHome from "./pages/UserHome";

// Home/Landing page component
function Home() {
  // This is the landing page. Students should see the Login and Register buttons here.
  return (
    <div className="home-background" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Welcome to Feel it</h1>
      <div style={{ marginTop: '2rem' }}>
        <MyButton />
      </div>
    </div>
  );
}

export default function App() {
  // The Router wraps the app and provides navigation between pages.
  return (
    <Router>
      <Routes>
        {/* Landing page route */}
        <Route path="/" element={<Home />} />
        {/* Login page route */}
        <Route path="/login" element={<Login />} />
        {/* Register page route */}
        <Route path="/register" element={<Register />} />
        {/* Signed-in homepage route */}
        <Route path="/home" element={<UserHome />} />
      </Routes>
    </Router>
  );
}
