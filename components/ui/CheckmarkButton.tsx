import React from 'react';

interface CheckmarkButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * CheckmarkButton - A circular teal button with a checkmark icon
 * Matches the design from bake-store CheckmarkButton.vue
 */
export const CheckmarkButton: React.FC<CheckmarkButtonProps> = ({
  onClick,
  isLoading = false,
  className = '',
  style,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isLoading && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`checkmark-button ${isLoading ? 'is-loading' : ''} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '45px',
        height: '48px',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        boxSizing: 'border-box',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        padding: 0,
        margin: 0,
        opacity: isLoading ? 0.7 : 1,
        ...style,
      }}
    >
      {!isLoading ? (
        <svg
          width="45"
          height="48"
          viewBox="0 0 45 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_checkmark)">
            <rect
              width="45"
              height="45"
              rx="22.5"
              fill="#4AC1BD"
              shapeRendering="crispEdges"
            />
            <rect
              x="0.5"
              y="0.5"
              width="44"
              height="44"
              rx="22"
              stroke="#25A49F"
              shapeRendering="crispEdges"
            />
            <path
              d="M15.5 22.9317L19.8867 27.3067L29.5 17.6934"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <filter
              id="filter0_d_checkmark"
              x="0"
              y="0"
              width="45"
              height="48"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="3" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.145098 0 0 0 0 0.643137 0 0 0 0 0.623529 0 0 0 1 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      ) : (
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(74, 193, 189, 0.3)',
            borderTop: '3px solid #4AC1BD',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .checkmark-button:hover:not(.is-loading) {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .checkmark-button:active:not(.is-loading) {
          transform: scale(0.95);
        }
      `}</style>
    </button>
  );
};

export default CheckmarkButton;
