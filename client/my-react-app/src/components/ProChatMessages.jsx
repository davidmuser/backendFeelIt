import React, { useEffect, useRef } from "react";

// myRole: the sender value that belongs to the current viewer (bubbles go right).
// Defaults to 'user' so the user screen works without explicitly passing the prop.
export default function ProChatMessages({ messages, myRole = "user" }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #dbeafe",
        borderRadius: "20px",
        padding: "1rem",
        minHeight: "430px",
        maxHeight: "54vh",
        overflowY: "auto",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.15rem" }}>
            Conversation
          </h2>
          <p style={{ margin: "0.3rem 0 0", color: "#64748b" }}>
            {messages.length} message{messages.length === 1 ? "" : "s"} in this
            session
          </p>
        </div>
        <span
          style={{
            padding: "0.35rem 0.7rem",
            borderRadius: "999px",
            background: "#f8fafc",
            color: "#475569",
            border: "1px solid #e2e8f0",
            fontSize: "0.88rem",
          }}
        >
          Private demo conversation
        </span>
      </div>

      {messages.length === 0 ? (
        <div
          style={{
            minHeight: "300px",
            display: "grid",
            placeItems: "center",
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Start the conversation by sending your first message.
        </div>
      ) : (
        messages.map((message) => {
          const isUser = message.sender === myRole;
          const isSystem = message.sender === "system";

          if (isSystem) {
            return (
              <p
                key={message.id}
                style={{
                  margin: "0.35rem 0 1rem",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "0.85rem",
                }}
              >
                {message.text}
              </p>
            );
          }

          return (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                marginBottom: "0.85rem",
              }}
            >
              <div
                style={{
                  maxWidth: "78%",
                  borderRadius: isUser
                    ? "18px 18px 6px 18px"
                    : "18px 18px 18px 6px",
                  padding: "0.85rem 0.95rem",
                  background: isUser
                    ? "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                    : "#f8fafc",
                  color: isUser ? "#ffffff" : "#0f172a",
                  border: isUser ? "none" : "1px solid #dbeafe",
                  boxShadow: isUser
                    ? "0 10px 24px rgba(37, 99, 235, 0.18)"
                    : "none",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                    opacity: isUser ? 0.85 : 0.65,
                  }}
                >
                  {message.senderName}
                </div>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{message.text}</p>
              </div>
            </div>
          );
        })
      )}

      <div ref={endRef} />
    </section>
  );
}
