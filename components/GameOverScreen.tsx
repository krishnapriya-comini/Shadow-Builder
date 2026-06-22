import React from 'react';
import { motion } from 'framer-motion';
import { strings } from '../strings';
import './GameScreen.css';

// Presentational only — App.tsx drives the gameoverScreen → endScreen
// transition (and emits the MFE event) after a 2s delay.
export const GameOverScreen: React.FC = () => {
  return (
    <div className="shadow-builder fixed inset-0 z-[200] flex flex-col items-center justify-center select-none p-4 overflow-hidden">
      {/* Sky-tinted backdrop matching the game */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,rgba(58,120,160,.82) 0%,rgba(80,170,210,.78) 100%)' }}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-[210] flex flex-col items-center"
      >
        {/* block badge */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 'clamp(56px, 11vw, 96px)', lineHeight: 1, marginBottom: 10, filter: 'drop-shadow(0 8px 0 rgba(20,70,100,.25))' }}
        >
          ⏰
        </motion.div>
        <div
          className="text-center"
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(48px, 8vw, 80px)',
            lineHeight: 1.05,
            color: '#ffffff',
            textShadow: '0 6px 0 #3d9b32, 0 9px 16px rgba(0,0,0,0.22)',
          }}
        >
          {strings.common.timeUp}
        </div>
        <div
          className="text-center"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(15px, 2.4vw, 19px)',
            color: '#eafaff',
            textShadow: '0 1px 0 rgba(20,70,100,.35)',
            marginTop: 6,
          }}
        >
          Let's see how you built!
        </div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;
