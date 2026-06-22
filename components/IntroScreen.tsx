/* ============================================================================
 * IntroScreen.tsx — themed title screen for "Shadow Builder"
 *
 * Replaces the generic beige starter-kit intro (chef + placeholder speech
 * bubble + "I'm ready" buttons) with a title screen that matches the actual
 * game in GameScreen.tsx: the same sky gradient, drifting cube clouds, sun and
 * birds, plus a small isometric "shadow → build" hero illustration that teases
 * the core mechanic. Shares the sb-* keyframes and Baloo 2 / Nunito fonts from
 * GameScreen.css.
 * ========================================================================== */
import { createElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import './GameScreen.css';

const e = (type: string, props?: Record<string, unknown> | null, ...children: ReactNode[]): ReactElement =>
  createElement(type, props as never, ...children);

type Pt = [number, number];
interface CubeStyle { top: string; left: string; right: string; stroke: string }

const GREEN: CubeStyle = { top: '#7ed86a', left: '#5bbf4a', right: '#3d9b32', stroke: '#2c7d24' };
const YELLOW: CubeStyle = { top: '#ffe27a', left: '#ffcf3f', right: '#e7b21f', stroke: '#c79412' };
const GHOST: CubeStyle = { top: '#dfe7ea', left: '#c5d2d7', right: '#aebcc2', stroke: '#9aa9b0' };

const pts = (a: Pt[]): string => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

// Request fullscreen on mobile web browsers (mirrors ReadyButtons behaviour).
const requestFullscreen = () => {
  const elem = document.documentElement;
  const isMobileWeb = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    && !(window as any).Capacitor;
  if (isMobileWeb && elem.requestFullscreen) {
    elem.requestFullscreen().catch((err) => console.log('Fullscreen request failed:', err));
  } else if (isMobileWeb && (elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen();
  }
};

// One isometric cube column of the given height at board cell (x, y).
const cube = (P: (a: number, b: number) => Pt, S: number, x: number, y: number, h: number, col: CubeStyle, key: string): ReactElement => {
  const up = (p: Pt, dd: number): Pt => [p[0], p[1] - dd];
  const B = 0.42;
  const fB = P(x - B, y - B), fR = P(x + B, y - B), fF = P(x + B, y + B), fL = P(x - B, y + B);
  const grp: ReactElement[] = [];
  for (let k = 0; k < h; k++) {
    const bR = up(fR, k * S), bF = up(fF, k * S), bL = up(fL, k * S);
    const tB = up(fB, (k + 1) * S), tR = up(fR, (k + 1) * S), tF = up(fF, (k + 1) * S), tL = up(fL, (k + 1) * S);
    grp.push(e('polygon', { key: 'r' + k, points: pts([bF, bR, tR, tF]), fill: col.right, stroke: col.stroke, strokeWidth: 1, strokeLinejoin: 'round' }));
    grp.push(e('polygon', { key: 'l' + k, points: pts([bL, bF, tF, tL]), fill: col.left, stroke: col.stroke, strokeWidth: 1, strokeLinejoin: 'round' }));
    grp.push(e('polygon', { key: 't' + k, points: pts([tB, tR, tF, tL]), fill: col.top, stroke: col.stroke, strokeWidth: 1, strokeLinejoin: 'round' }));
  }
  return e('g', { key }, grp);
};

// Hero illustration: a faint grey "shadow" blueprint on the left, the matching
// colourful build on the right — the game's promise in one picture.
const HeroScene = (): ReactElement => {
  // a little throne shape: tall back-left tower (3) + two short blocks (1)
  const shape: { x: number; y: number; h: number; col: CubeStyle }[] = [
    { x: 0, y: 0, h: 3, col: GREEN },
    { x: 1, y: 0, h: 1, col: YELLOW },
    { x: 0, y: 1, h: 1, col: GREEN },
  ];
  const sorted = [...shape].sort((a, b) => a.x + a.y - (b.x + b.y));

  const U = 26, Q = 13, S = 22;
  const ghostP = (a: number, b: number): Pt => [70 + (a - b) * U, 150 + (a + b) * Q];
  const buildP = (a: number, b: number): Pt => [250 + (a - b) * U, 150 + (a + b) * Q];

  const els: ReactElement[] = [];
  // ground tiles
  const tile = (P: (a: number, b: number) => Pt, fill: string, stroke: string, key: string) => {
    const oB = P(-0.55, -0.55), oR = P(2.55, -0.55), oF = P(2.55, 2.55), oL = P(-0.55, 2.55);
    return e('polygon', { key, points: pts([oB, oR, oF, oL]), fill, stroke, strokeWidth: 1.4, strokeLinejoin: 'round' });
  };
  els.push(tile(ghostP, 'rgba(255,255,255,.45)', '#bcd6e2', 'gground'));
  els.push(tile(buildP, '#8ccf3f', '#79bd33', 'bground'));

  sorted.forEach((s, i) => els.push(cube(ghostP, S, s.x, s.y, s.h, GHOST, 'g' + i)));
  sorted.forEach((s, i) => els.push(cube(buildP, S, s.x, s.y, s.h, s.col, 'b' + i)));

  // dashed arrow from shadow to build
  els.push(e('path', { key: 'arr', d: 'M 150 96 q 22 -16 44 0', fill: 'none', stroke: '#fff', strokeWidth: 3, strokeDasharray: '2 7', strokeLinecap: 'round', opacity: 0.9 }));
  els.push(e('polygon', { key: 'arrh', points: '190,84 202,96 188,100', fill: '#fff', opacity: 0.9 }));

  return e('div', { style: { animation: 'sb-islandBob 6s ease-in-out infinite', display: 'flex', justifyContent: 'center', width: '100%' } },
    e('svg', { width: 340, height: 230, viewBox: '0 0 360 240', style: { overflow: 'visible', display: 'block' } }, els));
};

const Cloud = ({ scale = 1 }: { scale?: number }): ReactElement => (
  <div style={{ display: 'flex', alignItems: 'flex-end', transform: `scale(${scale})` }}>
    <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 8, boxShadow: 'inset 0 -7px 0 rgba(200,228,238,.7)' }} />
    <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 11, margin: '0 -5px', boxShadow: 'inset 0 -9px 0 rgba(200,228,238,.7)' }} />
    <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 9, boxShadow: 'inset 0 -8px 0 rgba(200,228,238,.7)' }} />
  </div>
);

const Bird = ({ scale = 1 }: { scale?: number }): ReactElement => (
  <div style={{ animation: 'sb-flap 1.1s ease-in-out infinite', transform: `scale(${scale})` }}>
    <svg width="28" height="13" viewBox="0 0 28 13"><path d="M2 9 Q7 2 13 9 Q19 2 26 9" fill="none" stroke="#3a6477" strokeWidth="2.2" strokeLinecap="round" /></svg>
  </div>
);

export interface IntroScreenProps {
  onStart?: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const { startCountdown } = useGameStore();

  const handleStart = () => {
    requestFullscreen();
    onStart?.();
    startCountdown();
  };

  return (
    <div
      className="shadow-builder"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 150,
        background: 'linear-gradient(180deg,#6fcdec 0%,#8fdcf2 48%,#bff0fb 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      {/* ===== decorative sky (matches GameScreen) ===== */}
      <div style={{ position: 'absolute', top: 58, right: '13%', zIndex: 1 }}>
        <div style={{ width: 66, height: 66, borderRadius: 20, background: 'linear-gradient(135deg,#fff2ad,#ffce3a)', boxShadow: '0 7px 0 #e9a400,0 0 0 13px rgba(255,210,63,.16)' }} />
        <div style={{ position: 'absolute', top: -16, left: 24, width: 16, height: 16, borderRadius: 5, background: '#ffd23f', animation: 'sb-floaty 5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: 30, right: -20, width: 13, height: 13, borderRadius: 4, background: '#ffd23f', animation: 'sb-floaty2 6s ease-in-out infinite' }} />
      </div>
      <div style={{ position: 'absolute', top: 96, left: 0, zIndex: 1, animation: 'sb-flyLR 62s linear infinite', animationDelay: '-12s' }}><Cloud /></div>
      <div style={{ position: 'absolute', top: 210, left: 0, zIndex: 1, animation: 'sb-flyRL 82s linear infinite', animationDelay: '-44s' }}><Cloud scale={0.82} /></div>
      <div style={{ position: 'absolute', top: 250, left: 0, zIndex: 1, animation: 'sb-flyLR 30s linear infinite', animationDelay: '-6s' }}><Bird /></div>
      <div style={{ position: 'absolute', top: 150, left: 0, zIndex: 1, animation: 'sb-flyRL 34s linear infinite', animationDelay: '-14s' }}><Bird scale={0.7} /></div>

      {/* ===== title card ===== */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '0 24px', maxWidth: 560 }}
      >
        <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 14, letterSpacing: 4, color: '#eafaff', textShadow: '0 1px 0 rgba(40,110,140,.3)', marginBottom: 4 }}>
          🧩 A SHAPE PUZZLE
        </div>
        <h1 style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 'clamp(44px, 9vw, 76px)', lineHeight: 1, color: '#fff', margin: '0 0 6px', textShadow: '0 5px 0 rgba(40,110,140,.32)' }}>
          Shadow Builder
        </h1>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 'clamp(15px, 2.4vw, 19px)', lineHeight: 1.5, color: '#eafaff', margin: '0 0 6px', textShadow: '0 1px 0 rgba(40,110,140,.28)' }}>
          Read the grey shadow, stack blocks on your island, and match the shape to wake the mystery creature!
        </p>

        <HeroScene />

        <motion.button
          onClick={handleStart}
          initial={{ scale: 0, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 280, damping: 16 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: 6,
            padding: '16px 44px',
            borderRadius: 22,
            background: '#5bbf4a',
            color: '#fff',
            fontFamily: "'Baloo 2'",
            fontWeight: 800,
            fontSize: 22,
            boxShadow: '0 6px 0 #3d9b32',
          }}
        >
          Let's build! →
        </motion.button>
      </motion.div>
    </div>
  );
};

export default IntroScreen;
