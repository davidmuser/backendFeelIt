/**
 * ProDashboard.jsx
 * -----------------
 * Full-screen dashboard for logged-in professionals.
 *
 * Flow:
 *  1. On mount – reads the signed-in user from localStorage (auth.js).
 *     If the user is not a professional, redirects to /dashboard.
 *  2. "Go Online" toggle – emits `pro:go-online` via socket.io so the server
 *     adds this pro to the in-memory onlinePros map and broadcasts `pros:updated`
 *     to all connected clients.
 *  3. Listens for `room:user-joined` and `room:user-left` to track who is in the room.
 *  4. Listens for `room:message` and appends to the messages list.
 *  5. Sends messages via `message:send`.
 *  6. On unmount / "Go Offline" – emits `pro:go-offline` and disconnects.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import { connectSocket, disconnectSocket, getSocket } from "../utils/socket";
import ProChatMessages from "../components/ProChatMessages";
import ProChatComposer from "../components/ProChatComposer";

export default function ProDashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [isOnline, setIsOnline] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const proId = user?._id?.toString() ?? user?.email ?? "unknown";

  // Refs so the unmount cleanup always sees the latest values
  // without re-registering the effect every time state changes
  const isOnlineRef = useRef(false);
  const proIdRef = useRef(proId);
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);
  useEffect(() => {
    proIdRef.current = proId;
  }, [proId]);

  // Redirect non-pros
  useEffect(() => {
    if (!user?.isProfessional) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  // Socket setup
  useEffect(() => {
    const socket = connectSocket();

    socket.on("room:message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("room:user-joined", ({ userId, userName }) => {
      setConnectedUsers((prev) => {
        if (prev.find((u) => u.userId === userId)) return prev;
        return [...prev, { userId, userName }];
      });
    });

    socket.on("room:user-left", ({ userId }) => {
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    return () => {
      socket.off("room:message");
      socket.off("room:user-joined");
      socket.off("room:user-left");
    };
  }, []);

  // Cleanup on true page unmount only — empty deps so this never re-runs
  // (isOnlineRef / proIdRef always hold the latest values without being deps)
  useEffect(() => {
    return () => {
      if (isOnlineRef.current) {
        getSocket()?.emit("pro:go-offline", { proId: proIdRef.current });
      }
      disconnectSocket();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goOnline = useCallback(() => {
    // Ensure socket is connected before emitting
    const socket = connectSocket();
    socket.emit("pro:go-online", {
      proId,
      name: user?.name || user?.email || "Professional",
      role: user?.professionalRole || "Licensed Mental Health Counselor",
    });
    setIsOnline(true);
    setMessages([
      {
        id: "sys-init",
        sender: "system",
        senderName: "System",
        text: "You are now online. Waiting for users to connect…",
        timestamp: Date.now(),
      },
    ]);
  }, [proId, user]);

  const goOffline = useCallback(() => {
    getSocket().emit("pro:go-offline", { proId });
    setIsOnline(false);
    setConnectedUsers([]);
  }, [proId]);

  const sendMessage = useCallback(
    (text) => {
      getSocket().emit("message:send", {
        proId,
        senderId: proId,
        senderName: user?.name || user?.email || "Professional",
        senderRole: "professional",
        text,
      });
    },
    [proId, user],
  );

  const initials = (user?.name || user?.email || "P")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%)",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gap: "1rem",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #bbf7d0",
            borderRadius: "20px",
            padding: "1.25rem 1.4rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.07)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.95rem" }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {initials}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", color: "#0f172a" }}>
                {user?.name || user?.email}
              </h1>
              <p style={{ margin: "0.2rem 0 0", color: "#475569" }}>
                {user?.professionalRole || "Licensed Mental Health Counselor"}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                background: isOnline ? "#dcfce7" : "#f1f5f9",
                color: isOnline ? "#166534" : "#64748b",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: isOnline ? "#16a34a" : "#94a3b8",
                }}
              />
              {isOnline ? "Online — accepting users" : "Offline"}
            </span>

            <button
              type="button"
              onClick={isOnline ? goOffline : goOnline}
              style={{
                border: "none",
                borderRadius: "12px",
                background: isOnline ? "#fca5a5" : "#16a34a",
                color: isOnline ? "#7f1d1d" : "#ffffff",
                padding: "0.7rem 1.1rem",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
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
              Dashboard
            </button>
          </div>
        </div>

        {/* ── Connected users pill row ────────────────────────────────────── */}
        {isOnline && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #bbf7d0",
              borderRadius: "16px",
              padding: "0.85rem 1.1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
            }}
          >
            <span style={{ color: "#475569", fontWeight: 600 }}>
              Users in room:
            </span>
            {connectedUsers.length === 0 ? (
              <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                No users yet — they will appear here once they join your room.
              </span>
            ) : (
              connectedUsers.map((u) => (
                <span
                  key={u.userId}
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: "999px",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {u.userName}
                </span>
              ))
            )}
          </div>
        )}

        {/* ── Chat area ──────────────────────────────────────────────────── */}
        {isOnline ? (
          <>
            <ProChatMessages messages={messages} myRole="professional" />
            <ProChatComposer onSend={sendMessage} />
          </>
        ) : (
          <div
            style={{
              background: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: "20px",
              padding: "4rem 2rem",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
              You are currently offline.
            </p>
            <p style={{ margin: "0.75rem 0 0", lineHeight: 1.6 }}>
              Click <strong>Go Online</strong> above to start accepting users
              into your chat room.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
