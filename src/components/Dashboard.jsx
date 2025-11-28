import React from "react";

const stats = [
  { label: "Upcoming recordings", value: "3", detail: "this week" },
  { label: "Active shows", value: "4", detail: "in this workspace" },
  { label: "Confirmed guests", value: "18", detail: "ready to schedule" },
  { label: "Draft storylines", value: "7", detail: "in development" },
];

const upcoming = [
  {
    title: "Synchronic – S2E1",
    guest: "Dr. Elaine Brooks",
    date: "Tomorrow · 7:00 PM",
    type: "Remote interview",
  },
  {
    title: "Creator Spotlight",
    guest: "Arthur Ricco",
    date: "Fri · 3:30 PM",
    type: "Studio session",
  },
];

export default function Dashboard() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Dashboard</h2>
        <p style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
          Snapshot of shows, guests, and upcoming recordings inside Encore
          Studio.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(55,65,81,0.9)",
              background: "rgba(15,23,42,0.98)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                opacity: 0.75,
                textTransform: "uppercase",
                letterSpacing: 0.18,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{s.detail}</div>
          </div>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.1fr)",
          gap: 14,
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(55,65,81,0.9)",
            background: "rgba(15,23,42,0.98)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Upcoming recordings
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Week view</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {upcoming.map((u) => (
              <div
                key={u.title}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid rgba(55,65,81,0.7)",
                  background: "rgba(15,23,42,1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {u.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.8,
                        marginTop: 2,
                      }}
                    >
                      Guest: {u.guest}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.8,
                      textAlign: "right",
                    }}
                  >
                    {u.date}
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{u.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(55,65,81,0.9)",
            background: "rgba(15,23,42,0.98)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Production focus
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              fontSize: 12.5,
              opacity: 0.85,
            }}
          >
            <li>Finalize run-of-show for Synchronic launch.</li>
            <li>Confirm tech checks for all remote guests.</li>
            <li>Lock in recording dates for Q1 special series.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
