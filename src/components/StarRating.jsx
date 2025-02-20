// src/components/StarRating.jsx
import React, { useState } from "react";

/**
 * @param {number} value     The current rating (e.g., 1-5).
 * @param {function} onChange Callback when the user clicks a star.
 * @param {number} maxStars   How many stars to display (default 5).
 */
const StarRating = ({ value, onChange, maxStars = 5 }) => {
  // 'hover' will track which star index we're hovering over
  const [hover, setHover] = useState(0);

  return (
    <div className="flex space-x-1">
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
        <svg
          key={star}
          className={`w-6 h-6 cursor-pointer ${
            star <= (hover || value) ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.973a1 1 0 00.95.69h4.181c.969 
                   0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.363 1.118l1.286 
                   3.973c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 
                   1 0 00-1.176 0l-3.384 2.46c-.783.57-1.838-.197-1.539-1.118l1.286-3.973a1 
                   1 0 00-.363-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.181a1 
                   1 0 00.95-.69l1.285-3.973z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
