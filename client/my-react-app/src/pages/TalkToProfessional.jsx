import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProConnectionCard from "../components/ProConnectionCard";
import ProChatMessages from "../components/ProChatMessages";
import ProChatComposer from "../components/ProChatComposer";

const dummyProfessional = {
  name: "Dr. Maya Ben",
  role: "Licensed Mental Health Counselor",
};

const responsePool = [
  "Thank you for sharing that. You are not alone in this.",
  "That sounds heavy. Let's break it down one step at a time.",
  "I hear you. Would grounding exercises help right now?",
  "You're doing the right thing by reaching out. I'm here with you.",
];

export default function TalkToProfessional() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      senderName: "System",
      text: `${dummyProfessional.name} is now connected to this chat.`,
    },
    {
      id: 2,
      sender: "professional",
      senderName: dummyProfessional.name,
      text: "Hi, I am glad you reached out today. How are you feeling right now?",
    },
  ]);

  const nextId = useMemo(() => messages.length + 1, [messages.length]);

  const sendUserMessage = (text) => {
    const userMessage = {
      id: nextId,
      sender: "user",
      senderName: "You",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);

    window.setTimeout(() => {
      const randomReply =
        responsePool[Math.floor(Math.random() * responsePool.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "professional",
          senderName: dummyProfessional.name,
          text: randomReply,
        },
      ]);
    }, 500);
  };

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
            This secure demo chat lets you practice opening a conversation with
            a licensed professional.
          </p>
        </div>

        <ProConnectionCard
          professional={dummyProfessional}
          onBack={() => navigate("/dashboard")}
        />

        <ProChatMessages messages={messages} />

        <ProChatComposer onSend={sendUserMessage} />
      </div>
    </div>
  );
}
