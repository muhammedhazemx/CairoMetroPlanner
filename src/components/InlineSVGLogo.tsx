import React from 'react';

export const InlineSVGLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`drop-shadow-sm transition-transform duration-500 hover:rotate-45 ${className}`} 
      aria-hidden="true"
    >
      {/* Outer Red Star (Rub el Hizb) */}
      <g fill="#C01010">
        <rect x="15" y="15" width="70" height="70" rx="3" transform="rotate(0 50 50)" />
        <rect x="15" y="15" width="70" height="70" rx="3" transform="rotate(45 50 50)" />
      </g>
      {/* Inner Blue Star */}
      <g fill="#0050A0">
        <rect x="22" y="22" width="56" height="56" rx="2" transform="rotate(0 50 50)" />
        <rect x="22" y="22" width="56" height="56" rx="2" transform="rotate(45 50 50)" />
      </g>
      {/* Center Off-White Circle */}
      <circle cx="50" cy="50" r="18" fill="#F0F0F0" />
      {/* Bold Red M */}
      <text
        x="50"
        y="58"
        fontFamily="'Cairo', sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="#C01010"
        textAnchor="middle"
      >
        M
      </text>
    </svg>
  );
};
