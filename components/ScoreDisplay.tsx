import React, { useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { playTimerRunOut } from '../utils/soundEffects';

// Helper component for the odometer effect
const RollingCounter: React.FC<{ value: number }> = ({ value }) => {
    const ref = useRef<HTMLSpanElement>(null);
    // Ensure value is always a valid number (default to 0)
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    const spring = useSpring(safeValue, { stiffness: 60, damping: 15 });

    useEffect(() => {
        spring.set(safeValue);
    }, [safeValue, spring]);

    useEffect(() => {
        const unsubscribe = spring.on("change", (latest) => {
            if (ref.current) {
                const displayValue = Math.round(Number(latest));
                // Ensure we always show a number, even if NaN
                ref.current.textContent = isNaN(displayValue) ? "0" : displayValue.toString();
            }
        });
        return unsubscribe;
    }, [spring]);

    // Set initial value immediately to prevent empty state
    useEffect(() => {
        if (ref.current && !ref.current.textContent) {
            ref.current.textContent = safeValue.toString();
        }
    }, [safeValue]);

    return (
        <span
            ref={ref}
            style={{
                fontSize: '24px',
                color: '#000000',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'center',
            }}
        >
            {safeValue}
        </span>
    );
};

export const ScoreDisplay: React.FC = () => {
    const { score, timeRemaining } = useGameStore();
    const hasPlayedTimerSound = useRef(false);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const isUrgent = timeRemaining <= 10 && timeRemaining > 0;

    // Play timer run out sound when timer turns red (10 seconds remaining)
    useEffect(() => {
        if (timeRemaining === 10 && !hasPlayedTimerSound.current) {
            playTimerRunOut();
            hasPlayedTimerSound.current = true;
        }
        // Reset the flag if timer goes back above 10 (e.g., new game)
        if (timeRemaining > 10) {
            hasPlayedTimerSound.current = false;
        }
    }, [timeRemaining]);

    // Scorecard styling matching chef-cake-toppings-addition
    const cardStyle: React.CSSProperties = {
        position: 'relative',
        backgroundColor: '#FFFFFF',
        border: '5px solid #EEEEEE',
        borderTop: 'none',
        borderRadius: '0 0 14px 14px',
        height: '56px',
        display: 'flex',
        alignItems: 'stretch',
        padding: '0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    };

    const labelContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEEEEE',
        padding: '0 16px',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '16px',
        color: '#000000',
        fontWeight: 400,
        whiteSpace: 'nowrap',
    };

    const valueContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        backgroundColor: '#FFFFFF',
        minWidth: '60px',
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            right: '32px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-start',
            fontFamily: "'Gabarito', 'Fredoka', sans-serif",
            gap: '8px',
        }}>

            {/* Score Card */}
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ ...cardStyle, zIndex: 10 }}
            >
                <div style={labelContainerStyle}>
                    <span style={labelStyle}>Score</span>
                </div>
                <div style={valueContainerStyle}>
                    <RollingCounter value={score} />
                </div>
            </motion.div>

            {/* Timer Card */}
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{
                    y: 0,
                    opacity: 1,
                    x: isUrgent ? [0, -3, 3, -3, 3, 0] : 0,
                }}
                transition={{
                    y: { delay: 0.1 },
                    x: { duration: 0.4 },
                }}
                style={{
                    ...cardStyle,
                    borderColor: isUrgent ? '#DC2626' : '#EEEEEE'
                }}
            >
                <div style={{
                    ...labelContainerStyle,
                    backgroundColor: isUrgent ? '#DC2626' : '#EEEEEE'
                }}>
                    <span style={{ ...labelStyle, color: isUrgent ? '#FFFFFF' : '#000000' }}>
                        Timer
                    </span>
                </div>
                <div style={valueContainerStyle}>
                    <motion.span
                        key={timeRemaining}
                        initial={false}
                        animate={{
                            scale: isUrgent ? [1.4, 1] : 1,
                            color: isUrgent ? "#DC2626" : "#000000"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {formatTime(timeRemaining)}
                    </motion.span>
                </div>
            </motion.div>
        </div>
    );
};

export default ScoreDisplay;
