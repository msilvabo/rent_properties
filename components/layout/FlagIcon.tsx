import React from 'react';

interface FlagIconProps {
  code: string;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ code, className = 'w-5 h-3.5' }) => {
  const normalized = code.toLowerCase();

  switch (normalized) {
    case 'es':
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-[2px] shadow-xs object-cover border border-black/10 ${className}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#c60b1e" d="M0 0h640v480H0z" />
          <path fill="#ffc400" d="M0 120h640v240H0z" />
          <g transform="translate(130, 160) scale(0.65)">
            <path
              fill="#c60b1e"
              stroke="#ffffff"
              strokeWidth="6"
              d="M10 20 h70 v60 a35 35 0 0 1 -70 0 Z"
            />
            <path fill="#ffc400" d="M25 35 h40 v40 a20 20 0 0 1 -40 0 Z" />
            <circle cx="45" cy="55" r="10" fill="#c60b1e" />
            <path
              d="M15 12 L30 22 L45 8 L60 22 L75 12 L68 25 L22 25 Z"
              fill="#ffc400"
              stroke="#c60b1e"
              strokeWidth="3"
            />
          </g>
        </svg>
      );

    case 'en':
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-[2px] shadow-xs object-cover border border-black/10 ${className}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="640" height="480" fill="#bd3d44" />
          <path
            stroke="#ffffff"
            strokeWidth="37"
            d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640"
          />
          <rect width="260" height="258.5" fill="#192f5d" />
          <g fill="#ffffff">
            <circle cx="45" cy="35" r="10" />
            <circle cx="105" cy="35" r="10" />
            <circle cx="165" cy="35" r="10" />
            <circle cx="225" cy="35" r="10" />
            <circle cx="75" cy="75" r="10" />
            <circle cx="135" cy="75" r="10" />
            <circle cx="195" cy="75" r="10" />
            <circle cx="45" cy="115" r="10" />
            <circle cx="105" cy="115" r="10" />
            <circle cx="165" cy="115" r="10" />
            <circle cx="225" cy="115" r="10" />
            <circle cx="75" cy="155" r="10" />
            <circle cx="135" cy="155" r="10" />
            <circle cx="195" cy="155" r="10" />
            <circle cx="45" cy="195" r="10" />
            <circle cx="105" cy="195" r="10" />
            <circle cx="165" cy="195" r="10" />
            <circle cx="225" cy="195" r="10" />
            <circle cx="75" cy="235" r="10" />
            <circle cx="135" cy="235" r="10" />
            <circle cx="195" cy="235" r="10" />
          </g>
        </svg>
      );

    case 'fr':
      return (
        <svg
          viewBox="0 0 640 480"
          className={`inline-block shrink-0 rounded-[2px] shadow-xs object-cover border border-black/10 ${className}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="213.3" height="480" fill="#002654" />
          <rect x="213.3" width="213.4" height="480" fill="#ffffff" />
          <rect x="426.7" width="213.3" height="480" fill="#ce1126" />
        </svg>
      );

    default:
      return null;
  }
};
