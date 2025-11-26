import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

import AuthManager from "./components/AuthManager";
import VideoRoom from "./components/VideoRoom";

function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Encore Studio</h2>
      <p style={{ opacity: 0.8, marginBottom: 0 }}>
        Build stamp: 2025-11-25
      </p>
      <p style={{ opacity: 0.8 }}>
        If you still see the blue screen after this change, you are viewing an old deploy (or cached site).
      </p>
    </div>
  );
}

function VideoRoomRoute() {
  const { roomName } = useParams();
  return <VideoRoom roomName={roomName || "internal-team-meeting-room"} />;
}

function Navbar() {
  const defaultRoomName = "internal-team-meeting-room";

  return (
    <nav
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#111827",
        padding: "12px 16px",
        borderBottom: "1px solid #1f2937",
      }}
    >
      <div style={{ display: "flex", gap: 14 }}>
        <Link to="/" style={{ color: "#e5e7eb", textDecoration: "none", fontWeight: 700 }}>
          Home
        </Link>
        <Link
          to={`/video-room/${defaultRoomName}`}
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

        {/* If AuthManager ever crashes the app, temporarily comment this out to verify the UI deploy is correct. */}
        <AuthManager />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video-room/:roomName" element={<VideoRoomRoute />} />
          <Route path="*" element={<div style={{ padding: 20 }}>Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}
