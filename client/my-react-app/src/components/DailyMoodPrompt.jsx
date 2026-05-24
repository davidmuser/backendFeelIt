import React, { useEffect, useState } from "react";
import {
  getCurrentEmail,
  loadUserMoodState,
  saveUserMoodState,
} from "../utils/moodStorage";

const moodOptions = [
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "upset", emoji: "😕", label: "Upset" },
  { value: "okay", emoji: "🙂", label: "Okay" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "amazing", emoji: "🤩", label: "Amazing" },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDayCount(startDateString) {
  if (!startDateString) return 0;
  const start = new Date(startDateString);
  const today = new Date(getTodayKey());
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

function getFollowUpPrompt(mood) {
  if (mood === "sad" || mood === "upset") {
    return "What made you feel that way today?";
  }
  if (mood === "okay" || mood === "good") {
    return "What made you feel this way, or how can we make your day even better?";
  }
  if (mood === "amazing") {
    return "How can we make your day even more amazing? Share a happy positive word or thought.";
  }
  return "What are you feeling about today?";
}

async function getTodayMoodFromServer(email) {
  void email;
  return null;
}

async function saveTodayMoodToServer(email, mood, note) {
  void email;
  void mood;
  void note;
}

export default function DailyMoodPrompt() {
  const currentEmail = getCurrentEmail();
  const [submittedToday, setSubmittedToday] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    if (!currentEmail) return;
    // Call GET /user-health/today on the backend to load today's saved mood from the database.
    getTodayMoodFromServer(currentEmail);
    const saved = loadUserMoodState(currentEmail);
    setStartDate(saved?.startDate || null);
    if (saved?.answeredToday) {
      setSelectedMood(saved.mood);
      setSavedNote(saved.note || "");
      setSubmittedToday(true);
    }
  }, [currentEmail]);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setMoodNote("");
    setSubmittedToday(false);
  };

  const handleSaveNote = () => {
    if (!selectedMood || !currentEmail) return;
    // Call POST /user-health/today on the backend to save today's mood and note in user_health.
    saveTodayMoodToServer(currentEmail, selectedMood, moodNote);
    const saved = saveUserMoodState(currentEmail, selectedMood, moodNote);
    setSavedNote(saved.note || "");
    setStartDate(saved.startDate || null);
    setSubmittedToday(true);
  };

  const moodLabel = moodOptions.find(
    (item) => item.value === selectedMood,
  )?.label;
  const dayCount = getDayCount(startDate);
  const followUpPrompt = getFollowUpPrompt(selectedMood);

  if (!currentEmail) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          margin: "0 auto",
          padding: "1.75rem",
          background: "#eef4ff",
          border: "1px solid #d6e4ff",
          borderRadius: "22px",
          boxShadow: "0 20px 40px rgba(76, 126, 225, 0.12)",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.65rem", color: "#102a43" }}>
          Sign in to track your mood
        </h2>
        <p style={{ margin: "0.75rem 0 0", color: "#334e68" }}>
          We need your email to remember each journey separately.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "560px",
        margin: "0 auto",
        padding: "1.75rem",
        background: "#eef4ff",
        border: "1px solid #d6e4ff",
        borderRadius: "22px",
        boxShadow: "0 20px 40px rgba(76, 126, 225, 0.12)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.65rem", color: "#102a43" }}>
        How are you feeling today?
      </h2>
      <p
        style={{
          margin: "0.75rem 0 1.5rem",
          color: "#334e68",
          lineHeight: 1.6,
        }}
      >
        Choose one mood from sad/upset to amazing/star-eyes. You can answer only
        once per day.
      </p>

      {submittedToday ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div
            style={{
              background: "white",
              padding: "1rem 1.25rem",
              borderRadius: "18px",
              border: "1px solid #cbd5e1",
            }}
          >
            <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
              Today's mood
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "1.35rem" }}>
              {moodOptions.find((item) => item.value === selectedMood)?.emoji}{" "}
              {moodLabel}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "1rem 1.25rem",
              borderRadius: "18px",
              border: "1px solid #cbd5e1",
            }}
          >
            <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
              What you shared today
            </p>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "1rem",
                color: "#1e293b",
                whiteSpace: "pre-wrap",
              }}
            >
              {savedNote || "No extra note was added."}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "1rem 1.25rem",
              borderRadius: "18px",
              border: "1px solid #cbd5e1",
            }}
          >
            <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
              Journey start
            </p>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontSize: "1rem",
                color: "#1e293b",
              }}
            >
              {startDate
                ? `Started on ${new Date(startDate).toLocaleDateString()}`
                : "Start date not set yet."}
            </p>
            <p style={{ margin: "0.75rem 0 0", color: "#334e68" }}>
              {startDate
                ? `Day ${dayCount} of your journey`
                : "This is the first entry of your journey."}
            </p>
          </div>
        </div>
      ) : selectedMood ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div
            style={{
              background: "white",
              padding: "1rem 1.25rem",
              borderRadius: "18px",
              border: "1px solid #cbd5e1",
            }}
          >
            <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
              {moodOptions.find((item) => item.value === selectedMood)?.emoji}{" "}
              {moodLabel}
            </p>
            <p
              style={{
                margin: "0.5rem 0 0",
                color: "#334e68",
                lineHeight: 1.6,
              }}
            >
              {followUpPrompt}
            </p>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              rows={5}
              placeholder="Type how you feel here..."
              style={{
                width: "100%",
                marginTop: "1rem",
                borderRadius: "16px",
                border: "1px solid #cbd5e1",
                padding: "1rem",
                fontSize: "1rem",
                color: "#102a43",
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                marginTop: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={handleSaveNote}
                style={{
                  background: "#4C7EE1",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  padding: "0.95rem 1.25rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Save today's feeling
              </button>
              <button
                type="button"
                onClick={() => setSelectedMood(null)}
                style={{
                  background: "white",
                  color: "#334e68",
                  border: "1px solid #cbd5e1",
                  borderRadius: "14px",
                  padding: "0.95rem 1.25rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Choose a different mood
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "0.8rem",
          }}
        >
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleMoodSelect(option.value)}
              style={{
                border: "1px solid transparent",
                borderRadius: "15px",
                padding: "1rem 0.8rem",
                fontSize: "1.5rem",
                cursor: "pointer",
                background: "white",
                transition: "transform 0.2s, border-color 0.2s",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
              }}
            >
              <span role="img" aria-label={option.label}>
                {option.emoji}
              </span>
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.95rem",
                  color: "#334e68",
                }}
              >
                {option.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
