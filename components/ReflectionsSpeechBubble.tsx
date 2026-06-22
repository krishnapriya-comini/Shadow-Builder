import React, { useState, useEffect, useRef } from 'react';

interface ReflectionsSpeechBubbleProps {
  text: string;
  style?: React.CSSProperties;
}

// Dynamic sizing based on text length
const MIN_WIDTH = 100;
const MAX_WIDTH = 280;
const LINE_HEIGHT = 21;
const FIXED_PADDING_TOP = 6;
const FIXED_PADDING_BOTTOM = 14;
const FIXED_PADDING_HORIZONTAL = 8;

const getBubbleWidth = (textLength: number): number => {
  if (textLength <= 8) return MIN_WIDTH;
  if (textLength <= 15) return 130;
  if (textLength <= 25) return 160;
  if (textLength <= 40) return 200;
  if (textLength <= 60) return 240;
  return MAX_WIDTH;
};

const getBubbleHeight = (textLength: number, bubbleWidth: number): number => {
  const textAreaWidth = bubbleWidth - (FIXED_PADDING_HORIZONTAL * 2);
  const charsPerLine = Math.floor(textAreaWidth / 8);
  const estimatedLines = Math.max(1, Math.ceil(textLength / charsPerLine));
  const textHeight = estimatedLines * LINE_HEIGHT;
  return textHeight + FIXED_PADDING_TOP + FIXED_PADDING_BOTTOM;
};

export const ReflectionsSpeechBubble: React.FC<ReflectionsSpeechBubbleProps> = ({ text, style }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isFading, setIsFading] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [targetDimensions, setTargetDimensions] = useState(() => {
    const textLength = text?.length || 0;
    const width = getBubbleWidth(textLength);
    return { width, height: getBubbleHeight(textLength, width) };
  });
  const prevTextRef = useRef(text);
  const isFirstRender = useRef(true);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEntered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle text transition with fade effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayText(text);
      prevTextRef.current = text;
      const textLength = text?.length || 0;
      const width = getBubbleWidth(textLength);
      setTargetDimensions({ width, height: getBubbleHeight(textLength, width) });
      return;
    }
    
    if (text !== prevTextRef.current) {
      setIsFading(true);
      
      const resizeTimer = setTimeout(() => {
        const textLength = text?.length || 0;
        const width = getBubbleWidth(textLength);
        setTargetDimensions({ width, height: getBubbleHeight(textLength, width) });
      }, 150);
      
      const textTimer = setTimeout(() => {
        setDisplayText(text);
        setIsFading(false);
        prevTextRef.current = text;
      }, 350);
      
      return () => {
        clearTimeout(resizeTimer);
        clearTimeout(textTimer);
      };
    }
  }, [text]);

  const bubbleWidth = targetDimensions.width;
  const bubbleHeight = targetDimensions.height;

  return (
    <div 
      style={{
        position: 'absolute',
        width: `${bubbleWidth}px`,
        height: `${bubbleHeight}px`,
        zIndex: 999,
        display: 'inline-block',
        transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out, transform 0.5s ease-out, opacity 0.4s ease-out',
        transform: hasEntered ? 'translateY(0)' : 'translateY(30px)',
        opacity: hasEntered ? 1 : 0,
        ...style
      }}
    >
      {/* Bubble background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '8px',
          borderRadius: '12px',
          border: '1px solid #E4E4E4',
          backgroundColor: 'white',
        }}
      />
      
      {/* Pointy tail */}
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
      
      {/* Text content */}
      <div 
        style={{
          position: 'absolute',
          top: '6px',
          left: '8px',
          right: '8px',
          bottom: '14px',
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
            overflowWrap: 'normal',
            wordBreak: 'keep-all',
            width: '100%',
            opacity: isFading ? 0.3 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          {displayText}
        </p>
      </div>
    </div>
  );
};

export default ReflectionsSpeechBubble;
