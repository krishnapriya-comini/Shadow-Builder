import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useGameStore } from '../store/useGameStore';
import { ReflectionsScreen } from './ReflectionsScreen';
import { Chef } from './Chef';
import { SpeechBubble } from './SpeechBubble';
import { playSuccess } from '../utils/soundEffects';
import { strings } from '../strings';
import { SkyDecor } from './SkyDecor';
import confettiAnimation from '../assets/animations/confetti.json';
import './GameScreen.css';

const SCREEN_BREAKPOINT = 900;

interface EventBus {
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
}

interface GameOverLayerProps {
  eventBus?: EventBus | null;
}

export const GameOverLayer: React.FC<GameOverLayerProps> = ({ eventBus }) => {
  const { score, resetGame, restartGame } = useGameStore();
  const emitMfeEvent = (event: string, data: Record<string, unknown> = {}) => {
    eventBus?.emit(event, data);
  };
  const [showReflections, setShowReflections] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < SCREEN_BREAKPOINT : false
  );

  // Play success sound with confetti when end screen appears
  useEffect(() => {
    playSuccess();
  }, []);

  // Track screen size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < SCREEN_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="shadow-builder fixed inset-0 z-[500] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Sky-tinted backdrop matching the game */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-[500] backdrop-blur-[3px] pointer-events-auto"
        style={{ background: 'linear-gradient(180deg,rgba(58,120,160,.82) 0%,rgba(80,170,210,.78) 100%)' }}
      />

      {/* Decorative sky — sun, drifting cube clouds, birds */}
      <SkyDecor zIndex={505} />


      {/* Confetti Animation - shown on endScreen before ReflectionsScreen */}
      {!showReflections && (
        <div className="absolute inset-0 z-[510] pointer-events-none">
          <Lottie animationData={confettiAnimation} loop={false} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Chef - shown on endScreen before ReflectionsScreen (in foreground, above overlay) */}
      {!showReflections && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="absolute z-[520]"
          style={{
            left: '-69px',
            bottom: '0px',
          }}
        >
          <Chef />
        </motion.div>
      )}

      {/* Speech Bubble - shown on endScreen before ReflectionsScreen (above overlay) */}
      {!showReflections && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute z-[520] pointer-events-none"
          style={{
            left: isSmallScreen ? '135px' : '155px',  // 20px left on small screens
            bottom: isSmallScreen ? '90px' : '120px', // 30px down on small screens
          }}
        >
          <SpeechBubble text={strings.score.chef} />
        </motion.div>
      )}

      {/* Score Card - centered single-column layout */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative z-[520] flex flex-col items-center overflow-hidden bg-white"
        style={{
          width: 'min(260px, calc(100vw - 48px))',
          border: '6px solid #fff',
          borderRadius: '28px',
          boxShadow: '0px 10px 0px 0px rgba(45,125,160,0.35)',
        }}
      >
        <div
          className="flex w-full items-center justify-center gap-2"
          style={{
            height: '48px',
            background: 'linear-gradient(180deg,#7ed86a,#5bbf4a)',
          }}
        >
          <span style={{ fontSize: '18px' }}>🧱</span>
          <span
            className="text-white"
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: '17px',
              lineHeight: '1.2em',
            }}
          >
            {strings.score.label}
          </span>
        </div>

        <div
          className="flex w-full items-center justify-center bg-white"
          style={{ minHeight: '96px', padding: '18px 24px' }}
        >
          <span
            className="text-center"
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              color: '#244a5e',
              fontSize: '52px',
              lineHeight: '1.1em',
            }}
          >
            {score}
          </span>
        </div>
      </motion.div>

      {/* Bottom Right - Action Buttons (above overlay) */}
      <div className="absolute right-[24px] bottom-[24px] z-[520] flex flex-col gap-3 pointer-events-auto">
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          onClick={() => setShowReflections(true)}
          className="bg-white text-[#2c7da0] text-base px-6 py-3 rounded-2xl shadow-[0px_5px_0px_0px_rgba(70,130,160,0.3)] min-w-[150px] active:translate-y-[2px] transition-transform"
          style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800 }}
        >
          {strings.score.later}
        </motion.button>

        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          onClick={restartGame}
          className="bg-[#5bbf4a] text-white text-base px-6 py-3 rounded-2xl shadow-[0px_5px_0px_0px_#3d9b32] min-w-[150px] active:translate-y-[2px] transition-transform"
          style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800 }}
        >
          {strings.score.again}
        </motion.button>
      </div>

      {/* Reflections Screen - shown when "I'll do it later" is pressed */}
      <ReflectionsScreen
        isVisible={showReflections}
        onContinue={() => {
          setShowReflections(false);
          // In MFE mode, emit game-complete event to show monthly badge progress
          if (eventBus) {
            // First try the new event (mfe:game-complete) for monthly badge flow
            eventBus.emit('mfe:game-complete', {});

            // Fallback: If parent app doesn't handle game-complete, quit after delay
            // The parent app will prevent navigation if it handles the event
            setTimeout(() => {
              // This will only execute if parent didn't navigate away
              eventBus.emit('mfe:quit-challenge', {});
            }, 500);
          } else {
            // Standalone mode - just reset
            resetGame();
          }
        }}
        message={strings.reflections.message}
        completionMessage={strings.reflections.completion}
      />
    </div>
  );
};

export default GameOverLayer;
