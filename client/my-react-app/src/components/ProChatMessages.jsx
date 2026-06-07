import React, { useEffect, useRef } from "react";

export default function ProChatMessages({ messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px dashed #93c5fd",
        borderRadius: "14px",
        padding: "1rem",
      }}
    >
      <h2 style={{ margin: 0, color: "#0f172a" }}>אזור הודעות</h2>
      <p style={{ margin: "0.5rem 0 1rem", color: "#475569" }}>
        משימה: לרנדר רשימת הודעות ולבדל בין הודעות משתמש, מערכת ואיש מקצוע.
      </p>
      <p style={{ margin: "0 0 0.75rem", color: "#64748b" }}>
        כרגע קיימות {messages.length} הודעות.
      </p>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        {messages.slice(0, 3).map((message) => (
          <div
            key={message.id}
            style={{
              border: "1px solid #dbeafe",
              borderRadius: "10px",
              padding: "0.5rem",
            }}
          >
            {message.senderName}: {message.text}
          </div>
        ))}
      </div>
      <div ref={endRef} />
    </section>
  );
}
