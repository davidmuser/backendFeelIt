import React from "react";

export default function ProConnectionCard({ professional, onBack }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px dashed #93c5fd",
        borderRadius: "14px",
        padding: "1rem",
      }}
    >
      <h2 style={{ margin: 0, color: "#0f172a" }}>כרטיס חיבור איש מקצוע</h2>
      <p style={{ margin: "0.5rem 0", color: "#475569" }}>
        משימה: להציג שם, תפקיד, סטטוס חיבור וכפתור חזרה.
      </p>
      <p style={{ margin: "0 0 0.75rem", color: "#64748b" }}>
        נתוני דוגמה: {professional?.name || "ללא שם"}
      </p>
      <button type="button" onClick={onBack}>
        חזרה
      </button>
    </section>
  );
}
