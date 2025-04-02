import React, { useState } from 'react';
import './EmojiMeter.css';

const VibeMeter = () => {
  const [happiness, setHappiness] = useState(Math.floor(Math.random() * 101));
  const [loading, setLoading] = useState(false);

  // Determine mood based on happiness percentage
  const getMood = () => {
    if (happiness >= 70) return { icon: 'bi-emoji-smile-fill', text: 'Happy', color: 'success' };
    if (happiness >= 40) return { icon: 'bi-emoji-neutral-fill', text: 'Neutral', color: 'primary' };
    return { icon: 'bi-emoji-frown-fill', text: 'Sad', color: 'danger' };
  };

  // Calculate stroke dash offset for circle progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (happiness / 100) * circumference;
  const mood = getMood();

  // Handle refresh click
  const refreshHappiness = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setHappiness(Math.floor(Math.random() * 101));
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="vibe-meter">
   <div className={`vibe-circle ${mood.color}`}>
  <svg className="vibe-progress" width="200" height="200" viewBox="0 0 200 200">
    <circle
      className="vibe-progress-bg"
      cx="100"
      cy="100"
      r={radius}
      strokeWidth="10"
    />
    <circle
      className={`vibe-progress-fill vibe-${mood.color}`}
      cx="100"
      cy="100"
      r={radius}
      strokeWidth="10"
      strokeDasharray={circumference}
      strokeDashoffset={dashOffset}
    />
  </svg>
  <div className="vibe-content">
    <i className={`bi ${mood.icon} vibe-icon`}></i>
    <div className="vibe-percentage">{happiness}%</div>
    <div className="vibe-label">{mood.text}</div>
  </div>
</div>

      <button 
        className="vibe-button" 
        onClick={refreshHappiness} 
        disabled={loading}
      >
        <i className={`bi ${loading ? 'bi-arrow-repeat spin' : 'bi-arrow-clockwise'}`}></i>
        {loading ? 'Refreshing...' : 'Refresh Vibe'}
      </button>
    </div>
  );
};

export default VibeMeter;