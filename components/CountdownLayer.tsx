import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { playCountdown } from '../utils/soundEffects';
import { strings } from '../strings';
import './GameScreen.css';

export const CountdownLayer: React.FC = () => {
    const { startPlaying } = useGameStore();
    const [count, setCount] = useState(3);
    const hasPlayedSound = useRef(false);

    // Play countdown sound ONCE when component mounts (spans the entire countdown)
    useEffect(() => {
        if (!hasPlayedSound.current) {
            playCountdown();
            hasPlayedSound.current = true;
        }
    }, []);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => {
                setCount(count - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // When count hits 0 (after 1 is shown for 1 second), start the game immediately
            startPlaying();
        }
    }, [count, startPlaying]);

    return (
        <div className="shadow-builder fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Sky-tinted backdrop matching the game */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 backdrop-blur-[2px]"
                style={{ background: 'linear-gradient(180deg,rgba(58,120,160,.78) 0%,rgba(80,170,210,.74) 100%)' }}
            />

            {/* drifting cube clouds */}
            <div style={{ position: 'absolute', top: '22%', left: 0, animation: 'sb-flyLR 60s linear infinite', animationDelay: '-10s', opacity: 0.85 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: 30, height: 30, background: '#fff', borderRadius: 9, boxShadow: 'inset 0 -7px 0 rgba(200,228,238,.7)' }} />
                    <div style={{ width: 46, height: 46, background: '#fff', borderRadius: 12, margin: '0 -5px', boxShadow: 'inset 0 -9px 0 rgba(200,228,238,.7)' }} />
                    <div style={{ width: 34, height: 34, background: '#fff', borderRadius: 10, boxShadow: 'inset 0 -8px 0 rgba(200,228,238,.7)' }} />
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: '20%', left: 0, animation: 'sb-flyRL 80s linear infinite', animationDelay: '-30s', opacity: 0.7, transform: 'scale(.8)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 8, boxShadow: 'inset 0 -6px 0 rgba(200,228,238,.7)' }} />
                    <div style={{ width: 42, height: 42, background: '#fff', borderRadius: 11, margin: '0 -4px', boxShadow: 'inset 0 -9px 0 rgba(200,228,238,.7)' }} />
                    <div style={{ width: 30, height: 30, background: '#fff', borderRadius: 9, boxShadow: 'inset 0 -7px 0 rgba(200,228,238,.7)' }} />
                </div>
            </div>

            {/* Number + label */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div
                    style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 800,
                        fontSize: 'clamp(16px, 2.6vw, 22px)',
                        letterSpacing: 2,
                        color: '#eafaff',
                        textShadow: '0 2px 0 rgba(20,70,100,.4)',
                        marginBottom: 6,
                    }}
                >
                    {strings.countdown.getReady}
                </div>
                <AnimatePresence mode="wait">
                    {count > 0 && (
                        <motion.div
                            key={count}
                            initial={{ scale: 0.4, opacity: 0, y: 10 }}
                            animate={{ scale: 1.15, opacity: 1, y: 0 }}
                            exit={{ scale: 1.6, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                            style={{
                                fontFamily: "'Baloo 2', sans-serif",
                                fontSize: 'clamp(110px, 22vw, 180px)',
                                fontWeight: 800,
                                lineHeight: 1,
                                color: '#ffffff',
                                textShadow: '0 8px 0 #3d9b32, 0 10px 18px rgba(0,0,0,0.25)',
                            }}
                        >
                            {count}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CountdownLayer;
