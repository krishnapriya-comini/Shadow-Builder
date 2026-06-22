import React, { useMemo, useState, useEffect, useRef } from 'react';
import { voiceOverManager } from '../utils/VoiceOverManager';

interface SpeechBubbleProps {
    text: string;
    style?: React.CSSProperties;
    isTyping?: boolean;
    isTextFading?: boolean;
    playVoiceOver?: boolean; // Enable voice-over for this bubble
}

// Dynamic sizing based on text length - tighter fit (matching place-value-farm)
const MIN_WIDTH = 100;
const MAX_WIDTH = 260;
const LINE_HEIGHT = 21;
const FIXED_PADDING_TOP = 6;
const FIXED_PADDING_BOTTOM = 14;
const FIXED_PADDING_HORIZONTAL = 8;

const getBubbleWidth = (textLength: number): number => {
    // Use MAX_WIDTH for any longer text to prevent aggressive resizing
    if (textLength <= 8) return MIN_WIDTH;
    if (textLength <= 15) return 150;
    if (textLength <= 20) return 180;
    if (textLength <= 30) return 220;
    // Anything longer uses MAX_WIDTH
    return MAX_WIDTH;
};

const getBubbleHeight = (textLength: number, bubbleWidth: number): number => {
    const textAreaWidth = bubbleWidth - (FIXED_PADDING_HORIZONTAL * 2);
    const charsPerLine = Math.max(4, Math.floor(textAreaWidth / 7.5));
    const estimatedLines = Math.max(1, Math.ceil(textLength / charsPerLine));
    const textHeight = estimatedLines * LINE_HEIGHT;
    return Math.max(50, textHeight + FIXED_PADDING_TOP + FIXED_PADDING_BOTTOM + 8);
};

// Typing dots component
const TypingDots: React.FC<{ color?: string; size?: number }> = ({ color = '#A8794F', size = 10 }) => (
    <span className="inline-flex items-center gap-1">
        {[0, 1, 2].map((i) => (
            <span
                key={i}
                className="rounded-full animate-bounce"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.6s',
                }}
            />
        ))}
    </span>
);

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, style, isTyping, isTextFading = false, playVoiceOver = false }) => {
    const [displayText, setDisplayText] = useState(text);
    const [displayStyle, setDisplayStyle] = useState(style);
    const [isFading, setIsFading] = useState(false);
    const [hasEntered, setHasEntered] = useState(false);
    const [targetDimensions, setTargetDimensions] = useState(() => {
        const textLength = text?.length || 0;
        const width = getBubbleWidth(textLength);
        return { width, height: getBubbleHeight(textLength, width) };
    });
    const prevTextRef = useRef(text);
    const isFirstRender = useRef(true);
    const styleRef = useRef(style);
    styleRef.current = style;

    // Entrance animation - slide up from bottom
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasEntered(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Trigger voice-over when text changes (only if playVoiceOver is true)
    // Note: For intro steps, voice-over is now handled by the store for auto-advance
    useEffect(() => {
        if (playVoiceOver && text && text.trim() !== '') {
            // Small delay to let the text transition start
            const voiceTimer = setTimeout(() => {
                voiceOverManager.playNarrativeByText(text, {
                    fadeBackground: true,
                    interrupt: true,
                });
            }, 150);
            return () => clearTimeout(voiceTimer);
        }
    }, [text, playVoiceOver]);

    // Handle text transition with fade effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setDisplayText(text);
            prevTextRef.current = text;
            const textLength = text?.length || 0;
            const width = getBubbleWidth(textLength);
            setTargetDimensions({ width, height: getBubbleHeight(textLength, width) });
            setDisplayStyle(style);
            return;
        }

        if (text !== prevTextRef.current) {
            setIsFading(true);

            // Delay all updates (dimensions, style, text) to match fade timeline
            const textTimer = setTimeout(() => {
                const textLength = text?.length || 0;
                const width = getBubbleWidth(textLength);
                setTargetDimensions({ width, height: getBubbleHeight(textLength, width) });
                setDisplayText(text);
                setDisplayStyle(styleRef.current);
                setIsFading(false);
                prevTextRef.current = text;
            }, 250);

            return () => {
                clearTimeout(textTimer);
            };
        }
    }, [text]);

    // Update style immediately if not fading (e.g. movement), otherwise blocked by text effect
    useEffect(() => {
        if (!isFading) {
            setDisplayStyle(style);
        }
    }, [style, isFading]);

    const bubbleWidth = targetDimensions.width;
    const bubbleHeight = targetDimensions.height;

    return (
        <div
            className="absolute"
            style={{
                width: `${bubbleWidth}px`,
                height: `${bubbleHeight}px`,
                zIndex: 999,
                display: 'inline-block',
                transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out, transform 0.5s ease-out, opacity 0.4s ease-out',
                transform: hasEntered ? 'translateY(0)' : 'translateY(30px)',
                opacity: hasEntered ? 1 : 0,
                ...displayStyle
            }}
        >
            {/* Bubble background with CSS border-radius */}
            <div
                className="absolute bg-white"
                style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: '8px',
                    borderRadius: '12px',
                    border: '1px solid #E4E4E4',
                }}
            />

            {/* Pointy tail using rotated square */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '22px',
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    border: '1px solid #E4E4E4',
                    borderTop: 'none',
                    borderRight: 'none',
                    transform: 'rotate(-45deg)',
                    zIndex: 0,
                }}
            />

            {/* Text content container */}
            <div
                className="flex items-center justify-center"
                style={{
                    position: 'absolute',
                    top: '6px',
                    left: '8px',
                    right: '8px',
                    bottom: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <p
                    style={{
                        fontFamily: "'Gabarito', Arial, sans-serif",
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '1.3',
                        color: '#000000',
                        margin: 0,
                        padding: 0,
                        textAlign: 'center',
                        whiteSpace: 'normal',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'inline-block',
                        maxHeight: '100%',
                        opacity: (isFading || isTextFading) ? 0.3 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                    }}
                >
                    {isTyping ? (
                        <span className="flex justify-center">
                            <TypingDots color="#A8794F" size={10} />
                        </span>
                    ) : (
                        displayText
                    )}
                </p>
            </div>
        </div>
    );
};

export default SpeechBubble;
