import React from 'react';

interface AuraLensLogoProps {
  className?: string;
  size?: number;
  sizePx?: number;
}

/**
 * AuraLens bespoke logo:
 * An abstract fusion of an intelligent optical lens aperture
 * and harmonic emotional aura waves, symbolizing sentiment analysis,
 * emotion perception, and AI intelligence in calming botanical greens.
 */
export const AuraLensLogo: React.FC<AuraLensLogoProps> = ({
  className = 'w-6 h-6',
  size,
  sizePx,
}) => {
  const dimension = size || sizePx;
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={dimension ? { width: dimension, height: dimension } : undefined}
      aria-label="AuraLens Logo"
    >
      <defs>
        {/* Core Emerald Aura Gradient */}
        <linearGradient id="auraGradient1" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#88C9A1" />
          <stop offset="50%" stopColor="#76A98A" />
          <stop offset="100%" stopColor="#285943" />
        </linearGradient>

        {/* Luminous Inner Reflection */}
        <linearGradient id="auraGradient2" x1="40" y1="10" x2="8" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DCEEE1" />
          <stop offset="60%" stopColor="#A3BFA8" />
          <stop offset="100%" stopColor="#285943" />
        </linearGradient>

        {/* Center Neural Sentiment Node */}
        <radialGradient id="centerLensGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EAF5EC" />
          <stop offset="45%" stopColor="#88C9A1" />
          <stop offset="100%" stopColor="#285943" />
        </radialGradient>
      </defs>

      {/* Outer Harmonious Sentiment Aura Ring */}
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="url(#auraGradient1)"
        strokeWidth="2"
        strokeDasharray="3 2.5"
        strokeOpacity="0.6"
      />

      {/* Intertwined Aperture Arc 1 - Left Aura Wing */}
      <path
        d="M24 6C14.0589 6 6 14.0589 6 24C6 29.3512 8.34185 34.1557 12.0625 37.4375C12.875 36.125 15.2 32.8 17.5 30C21.2 25.5 24 22 24 16C24 12 24 8 24 6Z"
        fill="url(#auraGradient1)"
        fillOpacity="0.85"
      />

      {/* Intertwined Aperture Arc 2 - Right Aura Wing */}
      <path
        d="M24 42C33.9411 42 42 33.9411 42 24C42 18.6488 39.6582 13.8443 35.9375 10.5625C35.125 11.875 32.8 15.2 30.5 18C26.8 22.5 24 26 24 32C24 36 24 40 24 42Z"
        fill="url(#auraGradient2)"
        fillOpacity="0.85"
      />

      {/* Dynamic Emotion Wave Arc - Upper Resonance */}
      <path
        d="M12 20C15.5 15.5 20.5 13 26 13.5C31.5 14 36 17.5 38 22"
        stroke="#DCEEE1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Dynamic Emotion Wave Arc - Lower Sentiment Smile Arc */}
      <path
        d="M10 26C12 30.5 16.5 34 22 34.5C27.5 35 32.5 32.5 36 28"
        stroke="#88C9A1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Central Perception Lens Core */}
      <circle
        cx="24"
        cy="24"
        r="6.5"
        fill="url(#centerLensGlow)"
        stroke="#EAF5EC"
        strokeWidth="1.5"
      />

      {/* Central Focal Point / Neural Spark */}
      <circle
        cx="24"
        cy="24"
        r="2"
        fill="#FFFFFF"
      />
    </svg>
  );
};

export const AuraLensIcon = AuraLensLogo;
