import React, { useState } from 'react';
import './VibeMeter.css';

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

 

  return (
    <div className="vibe-meter">
        div.
    </div>
   
  );
};

export default VibeMeter;




