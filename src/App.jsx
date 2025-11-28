import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  NavLink,
  useParams,
} from "react-router-dom";

import VideoRoom from "./components/VideoRoom";
import AuthManager from "./components/AuthManager";

const BUILD_STAMP = "2025-11-26-1";

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #1f2937",
          background: "#111827",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Encore Studio</div>

          <NavLink
            to="/"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#93c5fd" : "#e5e7eb",
              fontWeight: 700,
            })}
          >
            Home
          </NavLink>

          <NavLink
            to="/video-room/internal-team-meeting-room"
            style={({ isActive }) => ({
              textDecoration: "none",
              color: isActive ? "#93c5fd" : "#e5e7eb",
              fontWeight: 700,
            })}
          >
            Interview Room
          </NavLink>
        </div>

        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Build: <b>{BUILD_STAMP}</b>
        </div>
      </header>

      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}

function Home() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Encore Studio</h2>
      <p style={{ opacity: 0.8 }}>
        If you can see this build stamp, you are viewing the correct deploy.
      </p>
    </div>
  );
}

function VideoRoomRoute() {
  const { roomName } = useParams();
  return <VideoRoom roomName={roomName || "internal-team-meeting-room"} />;
}

function NotFound() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Not Found</h2>
      <p style={{ opacity: 0.8 }}>This route doesn’t exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Shell>
        <AuthManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video-room/:roomName" element={<VideoRoomRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </Router>
  );
}
