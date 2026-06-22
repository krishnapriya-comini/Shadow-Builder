/* ============================================================================
 * SkyDecor.tsx — the shared decorative sky for Shadow Builder screens:
 * a blocky sun, drifting cube clouds, and flapping birds. Pointer-events are
 * off so it never blocks the UI. Drop it inside any full-bleed screen as a
 * background layer (give it a low z-index). Uses the sb-* keyframes/fonts from
 * GameScreen.css.
 * ========================================================================== */
import React from 'react';
import './GameScreen.css';

const Cloud: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', transform: `scale(${scale})` }}>
    <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 8, boxShadow: 'inset 0 -7px 0 rgba(200,228,238,.7)' }} />
    <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 11, margin: '0 -5px', boxShadow: 'inset 0 -9px 0 rgba(200,228,238,.7)' }} />
    <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 9, boxShadow: 'inset 0 -8px 0 rgba(200,228,238,.7)' }} />
  </div>
);

const Bird: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ animation: 'sb-flap 1.1s ease-in-out infinite', transform: `scale(${scale})` }}>
    <svg width="28" height="13" viewBox="0 0 28 13"><path d="M2 9 Q7 2 13 9 Q19 2 26 9" fill="none" stroke="#3a6477" strokeWidth="2.2" strokeLinecap="round" /></svg>
  </div>
);

export interface SkyDecorProps {
  zIndex?: number;
}

export const SkyDecor: React.FC<SkyDecorProps> = ({ zIndex = 1 }) => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex }}>
    {/* sun */}
    <div style={{ position: 'absolute', top: 56, right: '12%' }}>
      <div style={{ width: 66, height: 66, borderRadius: 20, background: 'linear-gradient(135deg,#fff2ad,#ffce3a)', boxShadow: '0 7px 0 #e9a400,0 0 0 13px rgba(255,210,63,.16)' }} />
      <div style={{ position: 'absolute', top: -16, left: 24, width: 16, height: 16, borderRadius: 5, background: '#ffd23f', animation: 'sb-floaty 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 30, right: -20, width: 13, height: 13, borderRadius: 4, background: '#ffd23f', animation: 'sb-floaty2 6s ease-in-out infinite' }} />
    </div>
    {/* drifting cube clouds */}
    <div style={{ position: 'absolute', top: 96, left: 0, animation: 'sb-flyLR 62s linear infinite', animationDelay: '-12s' }}><Cloud /></div>
    <div style={{ position: 'absolute', top: 230, left: 0, animation: 'sb-flyRL 82s linear infinite', animationDelay: '-44s' }}><Cloud scale={0.82} /></div>
    {/* birds */}
    <div style={{ position: 'absolute', top: 260, left: 0, animation: 'sb-flyLR 30s linear infinite', animationDelay: '-6s' }}><Bird /></div>
    <div style={{ position: 'absolute', top: 150, left: 0, animation: 'sb-flyRL 34s linear infinite', animationDelay: '-14s' }}><Bird scale={0.7} /></div>
  </div>
);

export default SkyDecor;
