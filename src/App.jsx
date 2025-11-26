import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

import AuthManager from "./components/AuthManager";
import VideoRoom from "./components/VideoRoom";

function Navbar() {
  const room = "internal-team-meeting-room";

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "12px 16px",
      backgroundColor: "#111827",
      borderBottom: "1px solid #1f2937",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link to="/" style={{ color: "#e5e7eb", textDecoration: "none", fontWeight: 800 }}>
          Encore Studio
        </Link>
        <Link to={"/video-room/" + room} style={{ color: "#93c5fd", textDecoration: "none", fontWeight: 700 }}>
          Guest Interview Room
        </Link>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7, color: "#e5e7eb" }}>Team</div>
    </nav>
  );
}

function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
    </div>
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
        <AuthManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video-room/:roomName" element={<VideoRoomRoute />} />
        </Routes>
      </div>
    </Router>
  );
}
