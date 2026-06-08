import React, { useState } from "react";

const quickOptions = [
  "I feel overwhelmed today.",
  "Can you help me slow down my thoughts?",
  "I need support planning the rest of my day.",
  "I would like to talk about stress at home.",
];

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
        border: "1px solid #dbeafe",
        borderRadius: "20px",
        padding: "1rem",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div style={{ marginBottom: "0.9rem" }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.15rem" }}>
          Send a message
        </h2>
        <p style={{ margin: "0.35rem 0 0", color: "#64748b", lineHeight: 1.5 }}>
          Use a quick prompt to start or write your own message below.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.55rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        {quickOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSend(option)}
            style={{
              border: "1px solid #bfdbfe",
              borderRadius: "999px",
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "0.55rem 0.8rem",
              cursor: "pointer",
              fontSize: "0.92rem",
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <form
        onSubmit={submitDraft}
        style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type what you want to share..."
          style={{
            flex: 1,
            minWidth: "240px",
            borderRadius: "14px",
            border: "1px solid #cbd5e1",
            padding: "0.9rem 1rem",
            fontSize: "1rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            border: "none",
            borderRadius: "14px",
            background: "#16a34a",
            color: "#ffffff",
            padding: "0.9rem 1.25rem",
            cursor: draft.trim() ? "pointer" : "not-allowed",
            fontWeight: 700,
            opacity: draft.trim() ? 1 : 0.7,
          }}
          disabled={!draft.trim()}
        >
          Send
        </button>
      </form>

      <p
        style={{ margin: "0.75rem 0 0", color: "#64748b", fontSize: "0.88rem" }}
      >
        Messages in this demo stay on the current screen only.
      </p>
    </section>
  );
}
