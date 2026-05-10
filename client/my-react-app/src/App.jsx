// App.jsx
// This is the main entry point for the app. Students should not need to change this file except to add new routes or wrap the app in providers.
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SupportChat from "./components/SupportChat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SplashScreen from "./components/SplashScreen";

// Home/Landing page component
function Home() {
  return <SplashScreen />;
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
        {/* Support chat route */}
        <Route path="/support" element={<SupportChat />} />
      </Routes>
    </Router>
  );
}
