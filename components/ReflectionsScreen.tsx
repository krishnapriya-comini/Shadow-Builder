import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Chef } from './Chef';
import { AchievementCard } from './AchievementCard';
import { CheckmarkButton } from './ui/CheckmarkButton';
import { ReflectionsSpeechBubble } from './ReflectionsSpeechBubble';
import { strings } from '../strings';

interface ReflectionsScreenProps {
  isVisible: boolean;
  onChefClick?: () => void;
  onContinue?: () => void;
  message?: string;
  completionMessage?: string;
  filledStars?: number;
  progress?: number;
}

export const ReflectionsScreen: React.FC<ReflectionsScreenProps> = ({
  isVisible,
  onChefClick,
  onContinue,
  message = strings.reflections.message,
  completionMessage = strings.reflections.completion,
  filledStars = 3,
  progress = 100,
}) => {
  const [hasEntered, setHasEntered] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showFirstCard, setShowFirstCard] = useState(false);

  const [currentMessage, setCurrentMessage] = useState(message);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setHasEntered(true);
        // Show first achievement card after entrance
        setTimeout(() => {
          setShowFirstCard(true);
        }, 300);
        // Show completion message and checkmark
        setTimeout(() => {
          setCurrentMessage(completionMessage);
          setTimeout(() => {
            setShowCheckmark(true);
          }, 500);
        }, 2000);
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    } else {
      setHasEntered(false);
      setShowCheckmark(false);
      setShowFirstCard(false);
      setCurrentMessage(message);
    }
  }, [isVisible, message, completionMessage]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'white',
        zIndex: 9999,
        pointerEvents: 'auto', // Override parent's pointer-events-none
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: hasEntered ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        {/* Chef - positioned at bottom left */}
        <div
          style={{
            position: 'absolute',
            left: '-69px',
            bottom: '0px',
            zIndex: 30,
          }}
        >
          <Chef />
        </div>

        {/* Speech Bubble - positioned next to chef */}
        <ReflectionsSpeechBubble
          text={currentMessage}
          style={{
            left: isSmallScreen ? '125px' : '165px',
            bottom: '27px',
          }}
        />

        {/* Achievement Card - centered */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'grid',
            gridTemplateColumns: '1fr',
            alignItems: 'center',
            justifyItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showFirstCard ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <AchievementCard
              title={strings.reflections.skillTitle}
              subtitle={strings.reflections.skillOutcome}
              filledStars={filledStars}
              progress={progress}
              animateProgress={showFirstCard}
            />
          </motion.div>
        </div>

        {/* Checkmark Button - appears after messages complete */}
        {showCheckmark && (
          <div
            style={{
              position: 'absolute',
              right: '30px',
              bottom: '30px',
              zIndex: 50,
            }}
          >
            <CheckmarkButton
              onClick={() => {
                onContinue?.();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionsScreen;
