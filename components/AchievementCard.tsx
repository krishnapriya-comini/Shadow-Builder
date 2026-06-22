import React, { useEffect, useState } from 'react';
import { StarRating } from './StarRating';

interface AchievementCardProps {
  title: string;
  subtitle: string;
  filledStars: number;
  totalStars?: number;
  progress?: number; // 0-100 percentage
  animateProgress?: boolean; // Whether to animate the progress bar
  className?: string;
  style?: React.CSSProperties;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  subtitle,
  filledStars,
  totalStars = 3,
  progress = 100,
  animateProgress = true,
  className = '',
  style = {},
}) => {
  const [currentProgress, setCurrentProgress] = useState(animateProgress ? 0 : progress);

  // Animate progress bar on mount
  useEffect(() => {
    if (animateProgress) {
      const timer = setTimeout(() => {
        setCurrentProgress(progress);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animateProgress, progress]);

  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '230px',
        ...style 
      }}
    >
      {/* Stars */}
      <StarRating 
        filledStars={filledStars} 
        totalStars={totalStars}
        size={24} 
        gap={8} 
      />

      {/* Title */}
      <h2 
        style={{ 
          fontFamily: "'Gabarito', sans-serif",
          fontWeight: 500,
          color: 'black',
          textAlign: 'center',
          fontSize: '20px', 
          lineHeight: '1.2', 
          marginTop: '14px',
          margin: '14px 0 0 0',
        }}
      >
        {title}
      </h2>

      {/* Subtitle */}
      <p 
        style={{ 
          fontFamily: "'Gabarito', sans-serif",
          fontWeight: 400,
          textAlign: 'center',
          fontSize: '14px', 
          lineHeight: '1.2', 
          color: '#828282', 
          marginTop: '4px',
          margin: '4px 0 0 0',
        }}
      >
        {subtitle}
      </p>

      {/* Progress Bar */}
      <div 
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#D9D9D9',
          borderRadius: '13px',
          marginTop: '16px',
          overflow: 'hidden',
        }}
      >
        <div 
          style={{
            width: `${currentProgress}%`,
            height: '100%',
            backgroundColor: '#5bbf4a',
            borderRadius: '13px',
            transition: animateProgress ? 'width 1s ease-out' : 'none',
          }}
        />
      </div>
    </div>
  );
};

export default AchievementCard;
