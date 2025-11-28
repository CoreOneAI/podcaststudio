import React from "react";

const items = [
  {
    date: "Mon",
    label: "Prep & planning",
    detail: "Outline questions for upcoming Synchronic episodes.",
  },
  {
    date: "Tue",
    label: "Guest follow-ups",
    detail: "Confirm availability and send tech checks.",
  },
  {
    date: "Wed",
    label: "Recording block",
    detail: "Back-to-back recording window · 4:00–7:30 PM.",
  },
  {
    date: "Thu",
    label: "Review & rough cuts",
    detail: "Listen back, flag highlights, and mark pick-ups.",
  },
];

export default function CalendarPage() {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20 }}>Calendar</h2>
        <p style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
          High-level production rhythm for the week. This can later connect to a
          real calendar provider.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((item) => (
          <div
            key={item.date}
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(55,65,81,0.9)",
              background: "rgba(15,23,42,1)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                opacity: 0.8,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 0.18,
              }}
            >
              {item.date}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
