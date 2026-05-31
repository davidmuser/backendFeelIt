import React, { useState } from 'react';
import './MoodSelector.css';

const MoodSelector = () => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    { emoji: '😀', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😱', label: 'Surprised' },
    { emoji: '😴', label: 'Sleepy' },
  ];

  const handleMoodClick = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <div className="mood-selector">
      <h2>How are you feeling today?</h2>
      <div className="mood-list">
        {moods.map((mood) => (
          <button
            key={mood.label}
            className={`mood-button ${selectedMood?.label === mood.label ? 'selected' : ''}`}
            onClick={() => handleMoodClick(mood)}
          >
            <span role="img" aria-label={mood.label}>
              {mood.emoji}
            </span>
          </button>
        ))}
      </div>
      {selectedMood && (
        <div className="selected-mood">
          <p>You are feeling: <strong>{selectedMood.label}</strong> {selectedMood.emoji}</p>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;