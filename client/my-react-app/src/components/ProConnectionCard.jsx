import React from "react";

export default function ProConnectionCard({ professional, onBack }) {
  // Accepts both { name, role } and { name, role, proId } shapes
  const professionalName = professional?.name || "Assigned Professional";
  const professionalRole = professional?.role || "Licensed Support Specialist";
  const initials = professionalName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #dbeafe",
        borderRadius: "20px",
        padding: "1.1rem 1.2rem",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.95rem" }}>
        <div
          aria-hidden="true"
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow: "0 10px 22px rgba(37, 99, 235, 0.22)",
          }}
        >
          {initials}
        </div>

        <div style={{ display: "grid", gap: "0.28rem" }}>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.18rem" }}>
            {professionalName}
          </h2>
          <p style={{ margin: 0, color: "#475569" }}>{professionalRole}</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.65rem",
                borderRadius: "999px",
                background: "#dcfce7",
                color: "#166534",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: "#16a34a",
                }}
              />
              Connected now
            </span>
            <span
              style={{
                padding: "0.3rem 0.65rem",
                borderRadius: "999px",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              Secure chat
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.55rem", justifyItems: "end" }}>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem" }}>
          Typical reply time: under a minute
        </p>
        <button
          type="button"
          onClick={onBack}
          style={{
            border: "none",
            borderRadius: "12px",
            background: "#e2e8f0",
            color: "#0f172a",
            padding: "0.7rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to dashboard
        </button>
      </div>
    </section>
  );
}
