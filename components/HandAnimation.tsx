import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HandAnimationProps {
  isVisible?: boolean;
  targetX?: number; // X position to point to
  targetY?: number; // Y position to point to
  delay?: number; // Delay before starting animation (ms)
}

/**
 * HandAnimation - Shows a pointing hand animation to guide user
 * Used during first gameplay as scaffolding
 */
export const HandAnimation: React.FC<HandAnimationProps> = ({
  isVisible = true,
  targetX = 100,
  targetY = 300,
  delay = 500,
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShouldShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, delay]);

  if (!isVisible || !shouldShow) return null;

  return (
    <motion.div
      className="absolute z-[50] pointer-events-none"
      style={{
        left: targetX,
        top: targetY,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Pointing Hand SVG */}
      <motion.svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Hand Palm */}
        <circle cx="20" cy="30" r="12" fill="#000D26" />

        {/* Fingers */}
        {/* Thumb */}
        <path d="M 12 28 Q 8 25 5 28" stroke="#000D26" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Index Finger (pointing) */}
        <motion.path
          d="M 20 18 L 20 5"
          stroke="#000D26"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={{
            y: [-2, 2, -2],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Middle Finger */}
        <path d="M 28 20 L 32 8" stroke="#000D26" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Ring Finger */}
        <path d="M 35 25 L 42 18" stroke="#000D26" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Pinky */}
        <path d="M 38 32 L 45 32" stroke="#000D26" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </motion.svg>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 13, 38, 0.1), transparent)',
          width: '80px',
          height: '80px',
          left: '-10px',
          top: '-10px',
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

export default HandAnimation;
