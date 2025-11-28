import React from "react";

const shows = [
  {
    title: "Synchronic",
    status: "In production",
    cadence: "Weekly · 45 min",
    description:
      "A narrative interview series exploring faith, science, and the moments that change everything.",
  },
  {
    title: "Creator Spotlight",
    status: "Recording",
    cadence: "Bi-weekly · 30 min",
    description:
      "Focused conversations with artists, entrepreneurs, and innovators building something new.",
  },
  {
    title: "Encore Sessions",
    status: "Development",
    cadence: "Monthly · Special",
    description:
      "Behind-the-scenes live sessions, commentary, and extended stories from the Encore universe.",
  },
];

export default function Shows() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Shows</h2>
        <p style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
          High-level view of your active and in-development shows.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {shows.map((show) => (
          <div
            key={show.title}
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid rgba(55,65,81,0.9)",
              background: "rgba(15,23,42,1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600 }}>{show.title}</div>
              <div
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(59,130,246,0.6)",
                  background: "rgba(15,23,42,0.9)",
                }}
              >
                {show.status}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.8,
                marginBottom: 6,
              }}
            >
              {show.cadence}
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.9 }}>
              {show.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
