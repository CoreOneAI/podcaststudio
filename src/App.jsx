import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import AuthManager from "./components/AuthManager";
import VideoRoom from "./components/VideoRoom";

const Home = () => (
  <div style={{ padding: 20 }}>
    <h2 style={{ marginTop: 0 }}>Encore Studio</h2>
    <p style={{ opacity: 0.8, marginBottom: 0 }}>
      Build stamp: 2025-11-25 (if you don’t see this, you’re not viewing the updated build)
    </p>
  </div>
);

function Navbar() {
  const defaultRoomName = "internal-team-meeting-room";
  return (
    <nav style={{
      display: "flex",
      gap: 16,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#111827",
      padding: "12px 16px",
      borderBottom: "1px solid #1f2937",
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        <Link to="/" style={{ color: "#e5e7eb", textDecoration: "none", fontWeight: 700 }}>
          Home
        </Link>
        <Link
          to={"/video-room/" + defaultRoomName}
          style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}
        >
          Interview Room
        </Link>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Team Portal</div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div style={{ backgroundColor: "#0b1220", color: "#e5e7eb", minHeight: "100vh" }}>
        <Navbar />
        <AuthManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video-room/:roomName" element={<VideoRoom />} />
        </Routes>
      </div>
    </Router>
  );
}
