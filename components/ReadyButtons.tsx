import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { BaseButton } from './BaseButton';
import { strings } from '../strings';
import { getAssetUrl } from '../utils/assetUrl';

// Request fullscreen on mobile web browsers
const requestFullscreen = () => {
    const elem = document.documentElement;

    // Check if we're in a mobile browser (not Capacitor native app)
    const isMobileWeb = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        && !(window as any).Capacitor;

    if (isMobileWeb && elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
            console.log('Fullscreen request failed:', err);
        });
    } else if (isMobileWeb && (elem as any).webkitRequestFullscreen) {
        // Safari iOS
        (elem as any).webkitRequestFullscreen();
    }
};

export const ReadyButtons: React.FC = () => {
    const { startCountdown } = useGameStore();

    const handleStart = () => {
        requestFullscreen();
        startCountdown();
    };

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '32px',
                right: '48px',
                display: 'flex',
                gap: '16px',
                zIndex: 200,
                pointerEvents: 'auto',
            }}
            data-tutorial-target="ready"
        >
            {/* Hand Animation - pointing to I'm ready button */}
            <motion.img
                src={getAssetUrl("/assets/hand.svg")}
                className="absolute z-[210] pointer-events-none w-12 h-12 drop-shadow-lg"
                style={{
                    top: '-15px',
                    left: '20px',
                }}
                animate={{
                    y: [0, 8, 0],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <BaseButton onClick={handleStart}>
                    {strings.ui.imReady}
                </BaseButton>
            </motion.div>

            <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <BaseButton onClick={handleStart}>
                    {strings.ui.letsGo}
                </BaseButton>
            </motion.div>
        </div>
    );
};

export default ReadyButtons;
