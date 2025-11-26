import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

import AuthManager from "./components/AuthManager";
import VideoRoom from "./components/VideoRoom";

const Home = () => (
  <div style={{ padding: 20 }}>
    <h2 style={{ marginTop: 0 }}>Encore Studio</h2>
    <p style={{ opacity: 0.8, marginBottom: 0 }}>
      Welcome. Use the menu to open the Interview Room.
    </p>

    {/* Optional deploy stamp (helps confirm Netlify is serving the latest build) */}
    <p style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
      Deploy stamp: 2025-11-26
    </p>
  </div>
);

function Navbar() {
  const defaultRoomName = "internal-team-meeting-room";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 16px",
        backgroundColor: "#111827",
        borderBottom: "1px solid #1f2937",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link
          to="/"
          style={{ color: "#e5e7eb", textDecoration: "none", fontWeight: 800, letterSpacing: 0.2 }}
        >
          Encore
        </Link>

        <Link
          to={"/video-room/" + defaultRoomName}
          style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}
        >
          Interview Room
        </Link>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7, color: "#e5e7eb" }}>Team Portal</div>
    </nav>
  );
}

function VideoRoomRoute() {
  const { roomName } = useParams();
  return <VideoRoom roomName={roomName} />;
}

export default function App() {
  return (
    <Router>
      <div style={{ backgroundColor: "#0b1220", color: "#e5e7eb", minHeight: "100vh" }}>
        <Navbar />

        {/* No enforcement: status badge only (safe for demos) */}
        <AuthManager />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video-room/:roomName" element={<VideoRoomRoute />} />
        </Routes>
      </div>
    </Router>
  );
}
