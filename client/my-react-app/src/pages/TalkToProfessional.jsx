/**
 * TalkToProfessional.jsx
 * ----------------------
 * User-facing chat screen.
 *
 * Flow:
 *  1. On mount – fetches the current online-pros list from GET /professionals/online.
 *     Also connects the socket and listens for `pros:updated` so the list updates live.
 *  2. User picks a pro from the list → emits `user:join-room`, switches to chat view.
 *  3. Receives `room:message` events and appends to the message list.
 *  4. Sends messages via `message:send`.
 *  5. On leave / unmount – emits `user:leave-room` and disconnects.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import { connectSocket, disconnectSocket, getSocket } from "../utils/socket";
import ProConnectionCard from "../components/ProConnectionCard";
import ProChatMessages from "../components/ProChatMessages";
import ProChatComposer from "../components/ProChatComposer";

export default function TalkToProfessional() {
  const navigate = useNavigate();
  const user = getUser();
  const userId = user?._id?.toString() ?? user?.email ?? "guest";
  const userName = user?.name || user?.email || "Anonymous User";

  const [onlinePros, setOnlinePros] = useState([]);
  const [selectedPro, setSelectedPro] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingPros, setLoadingPros] = useState(true);

  // Refs so the unmount cleanup always has the latest values
  const selectedProRef = useRef(null);
  const userIdRef = useRef(userId);
  const userNameRef = useRef(userName);
  useEffect(() => {
    selectedProRef.current = selectedPro;
  }, [selectedPro]);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  // Fetch initial pro list + subscribe to live updates
  useEffect(() => {
    const refreshPros = () => {
      fetch("http://localhost:3000/professionals/online")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setOnlinePros(data.professionals);
            setLoadingPros(false);
          }
        })
        .catch(() => setLoadingPros(false));
    };

    const handleProsUpdated = (pros) => {
      setOnlinePros(pros);
      setLoadingPros(false);
    };

    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    // Register all handlers BEFORE connecting so no event is missed
    const socket = connectSocket();
    socket.on("connect", refreshPros);
    socket.on("pros:updated", handleProsUpdated);
    socket.on("room:message", handleMessage);

    // If socket is already connected the "connect" event won't fire again — fetch now
    refreshPros();

    // Polling fallback: re-sync every 4 s in case any socket event was missed
    const poll = setInterval(refreshPros, 4000);

    return () => {
      socket.off("connect", refreshPros);
      socket.off("pros:updated", handleProsUpdated);
      socket.off("room:message", handleMessage);
      clearInterval(poll);
    };
  }, []);

  // Cleanup on true unmount only — empty deps so this never re-runs mid-session
  useEffect(() => {
    return () => {
      if (selectedProRef.current) {
        getSocket()?.emit("user:leave-room", {
          proId: selectedProRef.current.proId,
          userId: userIdRef.current,
          userName: userNameRef.current,
        });
      }
      disconnectSocket();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const joinPro = useCallback(
    (pro) => {
      setSelectedPro(pro);
      setMessages([]);
      getSocket().emit("user:join-room", {
        proId: pro.proId,
        userId,
        userName,
      });
    },
    [userId, userName],
  );

  const leavePro = useCallback(() => {
    if (selectedPro) {
      getSocket().emit("user:leave-room", {
        proId: selectedPro.proId,
        userId,
        userName,
      });
    }
    setSelectedPro(null);
    setMessages([]);
  }, [selectedPro, userId, userName]);

  const sendMessage = useCallback(
    (text) => {
      if (!selectedPro) return;
      getSocket().emit("message:send", {
        proId: selectedPro.proId,
        senderId: userId,
        senderName: userName,
        senderRole: "user",
        text,
      });
    },
    [selectedPro, userId, userName],
  );

  // ── Chat view ───────────────────────────────────────────────────────────
  if (selectedPro) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%)",
          padding: "2.2rem 1rem",
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
          <div>
            <h1
              style={{
                margin: "0 0 0.35rem",
                color: "#0f172a",
                fontSize: "2.2rem",
              }}
            >
              Talk to a Professional
            </h1>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
              You are now connected to {selectedPro.name}. Everything shared
              here is private to this session.
            </p>
          </div>

          <ProConnectionCard professional={selectedPro} onBack={leavePro} />

          <ProChatMessages messages={messages} myRole="user" />

          <ProChatComposer onSend={sendMessage} />
        </div>
      </div>
    );
  }

  // ── Pro selection view ──────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%)",
        padding: "2.2rem 1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gap: "1.25rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 0.35rem",
              color: "#0f172a",
              fontSize: "2.2rem",
            }}
          >
            Talk to a Professional
          </h1>
          <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
            Choose a professional below to start a private real-time chat
            session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            alignSelf: "start",
            border: "none",
            borderRadius: "12px",
            background: "#e2e8f0",
            color: "#0f172a",
            padding: "0.65rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Back to dashboard
        </button>

        {/* Online pros */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbeafe",
            borderRadius: "20px",
            padding: "1.4rem",
            boxShadow: "0 14px 34px rgba(15, 23, 42, 0.07)",
          }}
        >
          <h2
            style={{ margin: "0 0 1rem", color: "#0f172a", fontSize: "1.3rem" }}
          >
            Professionals Available Now
          </h2>

          {loadingPros ? (
            <p style={{ color: "#64748b" }}>Loading…</p>
          ) : onlinePros.length === 0 ? (
            <div
              style={{
                padding: "2.5rem",
                textAlign: "center",
                color: "#64748b",
                border: "1px dashed #cbd5e1",
                borderRadius: "14px",
              }}
            >
              <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
                No professionals online right now.
              </p>
              <p style={{ margin: "0.6rem 0 0", lineHeight: 1.6 }}>
                Please check back soon — professionals will appear here the
                moment they go online.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {onlinePros.map((pro) => (
                <div
                  key={pro.proId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                    background: "#f8fafc",
                    border: "1px solid #dbeafe",
                    borderRadius: "16px",
                    padding: "1rem 1.2rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "999px",
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)",
                        color: "#ffffff",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      {pro.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p
                        style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}
                      >
                        {pro.name}
                      </p>
                      <p
                        style={{
                          margin: "0.2rem 0 0",
                          color: "#475569",
                          fontSize: "0.92rem",
                        }}
                      >
                        {pro.role}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
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
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "999px",
                          background: "#16a34a",
                        }}
                      />
                      Online now
                    </span>
                    <button
                      type="button"
                      onClick={() => joinPro(pro)}
                      style={{
                        border: "none",
                        borderRadius: "12px",
                        background: "#2563eb",
                        color: "#ffffff",
                        padding: "0.65rem 1rem",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
