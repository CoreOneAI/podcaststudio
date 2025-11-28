import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useParams,
} from "react-router-dom";

import VideoRoom from "./components/VideoRoom";
import Dashboard from "./components/Dashboard";
import Shows from "./components/Shows";
import Guests from "./components/Guests";
import CalendarPage from "./components/CalendarPage";
import LoginPage from "./components/LoginPage";

const BUILD_STAMP = "2025-11-28-encore-v1";

function Shell({ children }) {
  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    color: isActive ? "#93c5fd" : "#e5e7eb",
    fontWeight: isActive ? 700 : 500,
    padding: "6px 10px",
    borderRadius: 999,
    backgroundColor: isActive ? "rgba(37, 99, 235, 0.15)" : "transparent",
    fontSize: 13,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #111827, #020617)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid #1f2937",
          background:
            "linear-gradient(to right, rgba(15,23,42,0.95), rgba(17,24,39,0.98))",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 800,
              letterSpacing: 0.24,
              fontSize: 16,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at 20% 20%, #38bdf8, #1d4ed8 45%, #020617 80%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              E
            </div>
            <span>Encore Studio</span>
          </div>

          <nav
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <NavLink to="/" style={linkStyle} end>
              Home
            </NavLink>
            <NavLink to="/dashboard" style={linkStyle}>
              Dashboard
            </NavLink>
            <NavLink to="/shows" style={linkStyle}>
              Shows
            </NavLink>
            <NavLink to="/guests" style={linkStyle}>
              Guests
            </NavLink>
            <NavLink to="/calendar" style={linkStyle}>
              Calendar
            </NavLink>
            <NavLink
              to="/video-room/internal-team-meeting-room"
              style={linkStyle}
            >
              Video Room
            </NavLink>
          </nav>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <NavLink to="/login" style={linkStyle}>
            Login
          </NavLink>
          <div
            style={{
              fontSize: 11,
              opacity: 0.75,
              textAlign: "right",
              lineHeight: 1.2,
            }}
          >
            Build:&nbsp;
            <b>{BUILD_STAMP}</b>
            <div style={{ fontSize: 10, opacity: 0.7 }}>
              Netlify · Vite · React
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          padding: "20px 20px 32px",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function Home() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1.3fr)",
        }}
      >
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            border: "1px solid rgba(55,65,81,0.8)",
            background:
              "radial-gradient(circle at top left, rgba(56,189,248,0.15), transparent 55%) #020617",
            boxShadow: "0 18px 40px rgba(15,23,42,0.75)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              letterSpacing: 0.2,
              fontWeight: 700,
            }}
          >
            Welcome to Encore Studio
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 14,
              opacity: 0.85,
              maxWidth: 520,
            }}
          >
            A private production workspace for planning interviews, managing
            guests, and recording episodes with AI-assisted workflows.
          </p>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(37,99,235,0.45)",
                fontSize: 12,
                background: "rgba(15,23,42,0.9)",
              }}
            >
              • Central dashboard for shows & guests
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(59,130,246,0.4)",
                fontSize: 12,
                background: "rgba(15,23,42,0.9)",
              }}
            >
              • AI notes & story prompts
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(56,189,248,0.45)",
                fontSize: 12,
                background: "rgba(15,23,42,0.9)",
              }}
            >
              • Integrated HD video room
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(55,65,81,0.8)",
              background:
                "radial-gradient(circle at top right, rgba(59,130,246,0.2), transparent 55%) #020617",
            }}
          >
            <div
              style={{
                fontSize: 12,
                opacity: 0.8,
                marginBottom: 4,
              }}
            >
              Quick glance
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Upcoming</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>3</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  interviews this week
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Guests</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>18</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  active guest profiles
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(55,65,81,0.8)",
              background: "rgba(15,23,42,0.95)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
              Next recording
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>
              “Synchronic – Season 2, Episode 1”
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              Tomorrow · 7:00 PM EST · Remote interview
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function VideoRoomRoute() {
  const { roomName } = useParams();
  return <VideoRoom roomName={roomName || "internal-team-meeting-room"} />;
}

function NotFound() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Not Found</h2>
      <p style={{ opacity: 0.8, fontSize: 14 }}>
        This route doesn’t exist in Encore Studio yet.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/video-room/:roomName" element={<VideoRoomRoute />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Shell>
    </Router>
  );
}
