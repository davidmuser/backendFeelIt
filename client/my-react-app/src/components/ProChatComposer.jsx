import React, { useState } from "react";

const quickOptions = ["הודעת דוגמה 1", "הודעת דוגמה 2"];

export default function ProChatComposer({ onSend }) {
  const [draft, setDraft] = useState("");

  const submitDraft = (event) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    onSend(value);
    setDraft("");
  };

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px dashed #93c5fd",
        borderRadius: "14px",
        padding: "1rem",
      }}
    >
      <h2 style={{ margin: 0, color: "#0f172a" }}>אזור כתיבה</h2>
      <p style={{ margin: "0.5rem 0 1rem", color: "#475569" }}>
        משימה: להשלים כפתורי הודעות מהירות ושדה טקסט לשליחה.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {quickOptions.map((option) => (
          <button key={option} type="button" onClick={() => onSend(option)}>
            {option}
          </button>
        ))}
      </div>

      <form onSubmit={submitDraft} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="כתבו הודעה"
        />
        <button type="submit">שליחה</button>
      </form>
    </section>
  );
}
