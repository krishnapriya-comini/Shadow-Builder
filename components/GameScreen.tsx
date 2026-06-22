/* ============================================================================
 * GameScreen.tsx — "Shadow Builder" puzzle game
 *
 * Converted from a standalone HTML bundle (custom DCLogic framework) into a
 * self-contained React component for embedding inside an MFE.
 *
 * What was kept:  all gameplay — the 3×3 build island (tap to stack a block,
 *                 tap again to grow it taller, wraps 0→1→2→3→0), board
 *                 rotation, the target "shadow" blueprint, the HUD, the level
 *                 carousel, Clear / Skip controls, the per-level win popup
 *                 ("Next level"), and the How-to-play drawer.
 * What was removed: the marketing landing chrome (nav bar + "Play free" CTA).
 *                 There were no separate start / end / score screens.
 *
 * Assets (fonts + keyframe animations) live in the sibling GameScreen.css.
 * ========================================================================== */
import { createElement, useCallback, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import './GameScreen.css';

// Loose wrapper around createElement: the SVG scene is built procedurally with
// dynamic attribute bags, so we deliberately bypass per-tag prop typing here.
const e = (type: string, props?: Record<string, unknown> | null, ...children: ReactNode[]): ReactElement =>
  createElement(type, props as never, ...children);

// --- types -----------------------------------------------------------------
type Pt = [number, number];
type Grid = number[][];
type Mood = 'happy' | 'sad' | 'wait' | null;
interface CubeStyle {
  top: string;
  left: string;
  right: string;
  stroke: string;
  face: Mood;
}
interface Level {
  name: string;
  emoji: string;
  sol: Grid;
}

// --- game data -------------------------------------------------------------
const LEVELS: Level[] = [
  { name: 'Tower', emoji: '🦉', sol: [[0, 0, 0], [0, 2, 0], [0, 0, 0]] },
  { name: 'Steps', emoji: '🐢', sol: [[1, 0, 0], [2, 0, 0], [3, 0, 0]] },
  { name: 'Pillars', emoji: '🐱', sol: [[2, 0, 2], [0, 0, 0], [2, 0, 2]] },
  { name: 'Throne', emoji: '🐸', sol: [[3, 1, 0], [1, 1, 0], [0, 0, 0]] },
  { name: 'Pyramid', emoji: '⭐', sol: [[1, 1, 1], [1, 3, 1], [1, 1, 1]] },
  { name: 'Castle', emoji: '🦖', sol: [[2, 1, 2], [1, 3, 1], [2, 1, 2]] },
  // ---- hard levels (after level 6, not shown in the carousel) ----
  { name: 'Spiral', emoji: '🐉', sol: [[3, 2, 1], [0, 0, 1], [1, 1, 1]] },
  { name: 'Towers', emoji: '👑', sol: [[3, 0, 3], [0, 2, 0], [3, 0, 3]] },
  { name: 'Fortress', emoji: '🏰', sol: [[2, 3, 2], [3, 1, 3], [2, 3, 2]] },
  { name: 'Labyrinth', emoji: '🤖', sol: [[3, 1, 2], [1, 3, 1], [2, 1, 3]] },
];
const PREVIEW = 6;

const GREEN: CubeStyle = { top: '#7ed86a', left: '#5bbf4a', right: '#3d9b32', stroke: '#2c7d24', face: 'happy' };
const RED: CubeStyle = { top: '#f4938a', left: '#e3645b', right: '#c84c44', stroke: '#a83a33', face: 'sad' };
const YELLOW: CubeStyle = { top: '#ffe27a', left: '#ffcf3f', right: '#e7b21f', stroke: '#c79412', face: 'wait' };
const GHOST: CubeStyle = { top: '#dfe7ea', left: '#c5d2d7', right: '#aebcc2', stroke: '#9aa9b0', face: null };

const emptyGrid = (): Grid => [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

// --- pure helpers ----------------------------------------------------------
const pts = (a: Pt[]): string => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

/** Maps a board cell through the current view rotation (0..3 quarter turns). */
const rotMap = (x: number, y: number, r: number): Pt => {
  if (r === 1) return [y, 2 - x];
  if (r === 2) return [2 - x, 2 - y];
  if (r === 3) return [2 - y, x];
  return [x, y];
};

const isMatch = (H: Grid, idx: number): boolean => {
  const s = LEVELS[idx].sol;
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (H[x][y] !== s[x][y]) return false;
  return true;
};
const count = (g: Grid): number => {
  let n = 0;
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) n += g[x][y];
  return n;
};

// sleepy / reactive face drawn on the left-front face of a cube
const face = (corners: Pt[], mood: Mood, key: string): ReactElement | null => {
  if (!mood) return null;
  const [gL, gF, tF, tL] = corners;
  const cx = (gL[0] + gF[0] + tF[0] + tL[0]) / 4;
  const cy = (gL[1] + gF[1] + tF[1] + tL[1]) / 4;
  const ink = '#3a2e22';
  const els: (ReactElement | null)[] = [];
  const closed = (ex: number, k: string) =>
    e('path', { key: k, d: 'M ' + (ex - 3.2) + ' ' + (cy - 1.5) + ' q 3.2 3 6.4 0', fill: 'none', stroke: ink, strokeWidth: 1.6, strokeLinecap: 'round' });
  const dot = (ex: number, k: string) => e('circle', { key: k, cx: ex, cy: cy - 1.5, r: 1.5, fill: ink });
  if (mood === 'sad') {
    els.push(dot(cx - 5.5, 'le'), dot(cx + 5.5, 're'));
    els.push(e('path', { key: 'm', d: 'M ' + (cx - 3) + ' ' + (cy + 6) + ' q 3 -2.5 6 0', fill: 'none', stroke: ink, strokeWidth: 1.4, strokeLinecap: 'round' }));
  } else {
    els.push(closed(cx - 5.5, 'le'), closed(cx + 5.5, 're'));
    if (mood === 'happy') {
      els.push(e('path', { key: 'm', d: 'M ' + (cx - 3.5) + ' ' + (cy + 4) + ' q 3.5 3 7 0', fill: 'none', stroke: ink, strokeWidth: 1.4, strokeLinecap: 'round' }));
      els.push(e('circle', { key: 'cl', cx: cx - 9, cy: cy + 2.5, r: 1.6, fill: 'rgba(255,120,120,.5)' }));
      els.push(e('circle', { key: 'cr', cx: cx + 9, cy: cy + 2.5, r: 1.6, fill: 'rgba(255,120,120,.5)' }));
    } else {
      // wait: small neutral 'o' mouth
      els.push(e('circle', { key: 'm', cx: cx, cy: cy + 4.5, r: 1.6, fill: 'none', stroke: ink, strokeWidth: 1.3 }));
    }
  }
  return e('g', { key }, els);
};

type Project = (a: number, b: number) => Pt;
type Lift = (p: Pt, dd: number) => Pt;

const cube = (P: Project, up: Lift, S: number, x: number, y: number, h: number, col: CubeStyle, depthKey: string): ReactElement => {
  const B = 0.42;
  const fB = P(x - B, y - B), fR = P(x + B, y - B), fF = P(x + B, y + B), fL = P(x - B, y + B);
  const grp: (ReactElement | null)[] = [];
  for (let k = 0; k < h; k++) {
    const bR = up(fR, k * S), bF = up(fF, k * S), bL = up(fL, k * S);
    const tB = up(fB, (k + 1) * S), tR = up(fR, (k + 1) * S), tF = up(fF, (k + 1) * S), tL = up(fL, (k + 1) * S);
    grp.push(e('polygon', { key: 'r' + k, points: pts([bF, bR, tR, tF]), fill: col.right, stroke: col.stroke, strokeWidth: 1, strokeLinejoin: 'round' }));
    grp.push(e('polygon', { key: 'l' + k, points: pts([bL, bF, tF, tL]), fill: col.left, stroke: col.stroke, strokeWidth: 1, strokeLinejoin: 'round' }));
    grp.push(e('polygon', { key: 't' + k, points: pts([tB, tR, tF, tL]), fill: col.top, stroke: col.stroke, strokeWidth: 1, strokeLinejoin: 'round' }));
    if (k === h - 1) grp.push(face([bL, bF, tF, tL], col.face, 'f'));
  }
  return e('g', { key: depthKey, style: { transformOrigin: fF[0] + 'px ' + fF[1] + 'px', animation: 'sb-popIn .3s cubic-bezier(.34,1.56,.64,1)' } }, grp);
};

// ---- scenery props --------------------------------------------------------
const tree = (P: Project, gx: number, gy: number, variant: string): ReactElement => {
  const base = P(gx, gy);
  const x = base[0], y = base[1];
  const pal: Record<string, string[]> = {
    green: ['#56c06a', '#3fa257', '#2f8246'],
    orange: ['#f3a23a', '#e07f1e', '#c96a12'],
    yellow: ['#ffdd55', '#f4c531', '#d9a516'],
    red: ['#ff7a6e', '#ef5347', '#cc3b30'],
  };
  const greens = pal[variant] || pal.green;
  const trunkW = 4, trunkH = 10;
  const els: ReactElement[] = [e('rect', { key: 'tr', x: x - trunkW / 2, y: y - trunkH, width: trunkW, height: trunkH + 2, rx: 1.5, fill: '#9a6a3c' })];
  const cone = (cyTop: number, w: number, hh: number, k: string) => {
    const ty = y - trunkH - cyTop;
    els.push(e('polygon', { key: 'cR' + k, points: pts([[x, ty - hh], [x + w, ty], [x, ty]]), fill: greens[2] }));
    els.push(e('polygon', { key: 'cL' + k, points: pts([[x, ty - hh], [x, ty], [x - w, ty]]), fill: greens[0] }));
    els.push(e('polygon', { key: 'cM' + k, points: pts([[x, ty - hh], [x - w, ty], [x + w, ty]]), fill: greens[1], opacity: 0 }));
  };
  cone(0, 13, 20, '0');
  cone(13, 10, 16, '1');
  cone(24, 7, 12, '2');
  return e('g', { key: 'tree' + gx + '-' + gy }, els);
};
const rock = (P: Project, gx: number, gy: number): ReactElement => {
  const b = P(gx, gy);
  const x = b[0], y = b[1];
  return e('g', { key: 'rock' + gx + '-' + gy }, [
    e('polygon', { key: 'a', points: pts([[x - 7, y], [x - 2, y - 7], [x + 5, y - 5], [x + 8, y], [x + 2, y + 3]]), fill: '#9aa6ac' }),
    e('polygon', { key: 'b', points: pts([[x - 2, y - 7], [x + 5, y - 5], [x + 8, y], [x - 2, y]]), fill: '#7d888f' }),
  ]);
};
const flower = (P: Project, gx: number, gy: number): ReactElement => {
  const b = P(gx, gy);
  const x = b[0], y = b[1];
  return e('g', { key: 'fl' + gx + '-' + gy }, [
    e('line', { key: 's', x1: x, y1: y, x2: x, y2: y - 9, stroke: '#3d8a3a', strokeWidth: 1.6 }),
    e('circle', { key: 'p', cx: x, cy: y - 10, r: 2.6, fill: '#ff5a5f' }),
  ]);
};
const tent = (P: Project, gx: number, gy: number): ReactElement => {
  const b = P(gx, gy);
  const x = b[0], y = b[1];
  return e('g', { key: 'tent' + gx + '-' + gy }, [
    e('polygon', { key: 'l', points: pts([[x, y - 20], [x - 15, y], [x, y]]), fill: '#6fc3b0' }),
    e('polygon', { key: 'r', points: pts([[x, y - 20], [x, y], [x + 15, y]]), fill: '#4ea48f' }),
    e('polygon', { key: 'd', points: pts([[x, y - 20], [x - 4, y], [x + 4, y]]), fill: '#2f7c69' }),
  ]);
};
const fire = (P: Project, gx: number, gy: number): ReactElement => {
  const b = P(gx, gy);
  const x = b[0], y = b[1];
  return e('g', { key: 'fire' + gx + '-' + gy }, [
    e('rect', { key: 'l1', x: x - 7, y: y - 2, width: 14, height: 3, rx: 1.5, fill: '#9a6a3c', transform: 'rotate(18 ' + x + ' ' + y + ')' }),
    e('rect', { key: 'l2', x: x - 7, y: y - 2, width: 14, height: 3, rx: 1.5, fill: '#8a5a30', transform: 'rotate(-22 ' + x + ' ' + y + ')' }),
    e('polygon', { key: 'fl', points: pts([[x, y - 14], [x - 4, y - 3], [x + 4, y - 3]]), fill: '#ff8a3d' }),
    e('polygon', { key: 'fl2', points: pts([[x, y - 9], [x - 2.4, y - 3], [x + 2.4, y - 3]]), fill: '#ffd23f' }),
  ]);
};

// ---- the playable island --------------------------------------------------
const buildIsland = (wpx: number, H: Grid, level: number, viewRot: number, onTap: (x: number, y: number) => void, highlight: boolean): ReactElement => {
  const sol = LEVELS[level].sol;
  const OX = 205, OY = 128, U = 36, Q = 18, S = 30, D = 46, m = 0.9;
  const P: Project = (a, b) => [OX + (a - b) * U, OY + (a + b) * Q];
  const up: Lift = (p, dd) => [p[0], p[1] - dd];
  const els: ReactElement[] = [];

  // dirt sides
  const oB = P(-m, -m), oR = P(2 + m, -m), oF = P(2 + m, 2 + m), oL = P(-m, 2 + m);
  els.push(e('polygon', { key: 'dL', points: pts([oL, oF, [oF[0], oF[1] + D], [oL[0], oL[1] + D]]), fill: '#a86b3a' }));
  els.push(e('polygon', { key: 'dR', points: pts([oF, oR, [oR[0], oR[1] + D], [oF[0], oF[1] + D]]), fill: '#8a5528' }));
  // soil speckle bands
  els.push(e('polygon', { key: 'dL2', points: pts([oL, oF, [oF[0], oF[1] + 11], [oL[0], oL[1] + 11]]), fill: '#b9824e' }));
  els.push(e('polygon', { key: 'dR2', points: pts([oF, oR, [oR[0], oR[1] + 11], [oF[0], oF[1] + 11]]), fill: '#9c6a3c' }));
  // grass top
  els.push(e('polygon', { key: 'grass', points: pts([oB, oR, oF, oL]), fill: '#8ccf3f', stroke: '#79bd33', strokeWidth: 1.5, strokeLinejoin: 'round' }));
  // subtle grid
  const GB = [-0.5, 0.5, 1.5, 2.5];
  GB.forEach((c, i) => { const a = P(c, -0.5), b = P(c, 2.5); els.push(e('line', { key: 'gx' + i, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#7cbf36', strokeWidth: 1, opacity: 0.55 })); });
  GB.forEach((c, i) => { const a = P(-0.5, c), b = P(2.5, c); els.push(e('line', { key: 'gy' + i, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#7cbf36', strokeWidth: 1, opacity: 0.55 })); });

  // depth-sorted props + cubes — the whole island rotates with the view
  const R = (gx: number, gy: number) => rotMap(gx, gy, viewRot);
  const objs: { d: number; fn: () => ReactElement }[] = [];
  const prop = (gx: number, gy: number, fn: (rx: number, ry: number) => ReactElement) => {
    const r = R(gx, gy);
    objs.push({ d: r[0] + r[1], fn: () => fn(r[0], r[1]) });
  };
  // scenery anchored to the grass corners/edges (rotates around the board centre)
  prop(-0.72, -0.72, (gx, gy) => tree(P, gx, gy, 'green'));
  prop(2.74, -0.7, (gx, gy) => tree(P, gx, gy, 'yellow'));
  prop(-0.78, 0.2, (gx, gy) => flower(P, gx, gy));
  prop(2.82, 0.7, (gx, gy) => rock(P, gx, gy));
  prop(-0.8, 1.6, (gx, gy) => flower(P, gx, gy));
  prop(2.72, 2.72, (gx, gy) => tree(P, gx, gy, 'red'));
  prop(-0.7, 2.72, (gx, gy) => tree(P, gx, gy, 'orange'));
  prop(1.0, 2.92, (gx, gy) => tent(P, gx, gy));
  prop(1.85, 2.95, (gx, gy) => fire(P, gx, gy));
  prop(0.2, 2.86, (gx, gy) => flower(P, gx, gy));
  prop(-0.8, 2.4, (gx, gy) => rock(P, gx, gy));
  // cubes. exact height → green; right cell but too short → yellow; wrong cell or too tall → red
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) {
    const h = H[x][y];
    if (h > 0) {
      const want = sol[x][y];
      let col: CubeStyle;
      if (h === want) col = GREEN;
      else if (want > 0 && h < want) col = YELLOW;
      else col = RED;
      const d2 = R(x, y);
      const dx = d2[0], dy = d2[1];
      objs.push({ d: dx + dy + 0.05, fn: () => cube(P, up, S, dx, dy, h, col, 'c' + x + '-' + y + '-' + h + '-' + col.top) });
    }
  }
  objs.sort((a, b) => a.d - b.d);
  objs.forEach((o) => els.push(o.fn()));

  // tap targets: full column silhouette per cell, depth-sorted so the front tower wins overlaps
  const tgs: { d: number; el: ReactElement }[] = [];
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) {
    const h = H[x][y], liftH = h * S;
    const d2 = rotMap(x, y, viewRot);
    const dx = d2[0], dy = d2[1];
    const fLb = P(dx - 0.5, dy + 0.5), fFb = P(dx + 0.5, dy + 0.5), fRb = P(dx + 0.5, dy - 0.5);
    const tLt = up(P(dx - 0.5, dy + 0.5), liftH), tBt = up(P(dx - 0.5, dy - 0.5), liftH), tRt = up(P(dx + 0.5, dy - 0.5), liftH);
    const sil = [tLt, tBt, tRt, fRb, fFb, fLb];
    tgs.push({ d: dx + dy, el: e('polygon', { key: 'h' + x + '-' + y, points: pts(sil), fill: 'rgba(0,0,0,0)', style: { cursor: 'pointer' }, onClick: () => onTap(x, y) }) });
  }
  tgs.sort((a, b) => a.d - b.d);
  tgs.forEach((t) => els.push(t.el));

  // tutorial "tap here" ring — drawn last so it sits on top of the centre tile.
  // (1,1) is rotation-invariant, so it stays put as the board spins.
  if (highlight) {
    const c = P(1, 1);
    els.push(e('ellipse', {
      key: 'tut-ring',
      cx: c[0], cy: c[1], rx: 27, ry: 14,
      fill: 'rgba(255,255,255,0.12)', stroke: '#ffffff', strokeWidth: 3,
      style: {
        transformBox: 'fill-box',
        transformOrigin: 'center',
        animation: 'sb-tapPulse 1.6s ease-in-out infinite',
        filter: 'drop-shadow(0 0 3px rgba(91,191,74,0.9))',
        pointerEvents: 'none',
      },
    }));
  }

  return e('div', { style: { animation: 'sb-islandBob 6s ease-in-out infinite' } },
    e('svg', { width: wpx, height: Math.round((wpx * 270) / 300), viewBox: '55 26 300 270', style: { overflow: 'visible', display: 'block' } }, els));
};

// ---- small blueprint (target shadow, grey) --------------------------------
const buildBlueprint = (level: number): ReactElement => {
  const sol = LEVELS[level].sol;
  const OX = 120, OY = 60, U = 20, Q = 10, S = 13, m = 0.55;
  const P: Project = (a, b) => [OX + (a - b) * U, OY + (a + b) * Q];
  const up: Lift = (p, dd) => [p[0], p[1] - dd];
  const els: ReactElement[] = [];
  const oB = P(-m, -m), oR = P(2 + m, -m), oF = P(2 + m, 2 + m), oL = P(-m, 2 + m);
  els.push(e('polygon', { key: 'bd', points: pts([oB, oR, oF, oL]), fill: '#eef4f6', stroke: '#cfdde2', strokeWidth: 1.2 }));
  const GB = [-0.5, 0.5, 1.5, 2.5];
  GB.forEach((c, i) => { const a = P(c, -0.5), b = P(c, 2.5); els.push(e('line', { key: 'x' + i, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#d6e2e7', strokeWidth: 1 })); });
  GB.forEach((c, i) => { const a = P(-0.5, c), b = P(2.5, c); els.push(e('line', { key: 'y' + i, x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#d6e2e7', strokeWidth: 1 })); });
  const items: { x: number; y: number; h: number }[] = [];
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (sol[x][y] > 0) items.push({ x, y, h: sol[x][y] });
  items.sort((a, b) => a.x + a.y - (b.x + b.y));
  const B = 0.42;
  items.forEach((it) => {
    const { x, y, h } = it;
    const fB = P(x - B, y - B), fR = P(x + B, y - B), fF = P(x + B, y + B), fL = P(x - B, y + B);
    for (let k = 0; k < h; k++) {
      const bR = up(fR, k * S), bF = up(fF, k * S), bL = up(fL, k * S);
      const tB = up(fB, (k + 1) * S), tR = up(fR, (k + 1) * S), tF = up(fF, (k + 1) * S), tL = up(fL, (k + 1) * S);
      els.push(e('polygon', { key: 'r' + x + y + k, points: pts([bF, bR, tR, tF]), fill: GHOST.right, stroke: GHOST.stroke, strokeWidth: 0.8 }));
      els.push(e('polygon', { key: 'l' + x + y + k, points: pts([bL, bF, tF, tL]), fill: GHOST.left, stroke: GHOST.stroke, strokeWidth: 0.8 }));
      els.push(e('polygon', { key: 't' + x + y + k, points: pts([tB, tR, tF, tL]), fill: GHOST.top, stroke: GHOST.stroke, strokeWidth: 0.8 }));
    }
  });
  return e('svg', { width: 184, height: 120, viewBox: '38 0 160 116', style: { overflow: 'visible', display: 'block' } }, els);
};

// ============================================================================
// Component
// ============================================================================
export interface GameScreenProps {
  /** Optional: notified each time a level's shape is matched. */
  onLevelComplete?: (level: Level, levelIndex: number) => void;
}

export default function GameScreen({ onLevelComplete }: GameScreenProps): ReactElement {
  const [H, setH] = useState<Grid>(emptyGrid);
  const [level, setLevel] = useState(0);
  const [win, setWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [viewRot, setViewRot] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const lv = LEVELS[level];

  const tap = useCallback((x: number, y: number) => {
    setShowTutorial(false);
    setH((prev) => {
      const next = prev.map((r) => r.slice());
      next[x][y] = (next[x][y] + 1) % 4;
      const matched = isMatch(next, level);
      setWin(matched);
      if (matched) onLevelComplete?.(LEVELS[level], level);
      return next;
    });
  }, [level, onLevelComplete]);

  const selLvl = useCallback((i: number) => {
    setLevel(i);
    setH(emptyGrid());
    setWin(false);
  }, []);
  const clearAll = useCallback(() => { setH(emptyGrid()); setWin(false); }, []);
  const nextLvl = useCallback(() => selLvl((level + 1) % LEVELS.length), [level, selLvl]);
  const spin = useCallback((d: number) => setViewRot((r) => (r + d + 4) % 4), []);

  const island = useMemo(() => buildIsland(700, H, level, viewRot, tap, showTutorial && !win), [H, level, viewRot, tap, showTutorial, win]);
  const blueprint = useMemo(() => buildBlueprint(level), [level]);

  return (
    <div
      className="shadow-builder"
      style={{ minHeight: '100%', height: '100%', background: 'linear-gradient(180deg,#6fcdec 0%,#8fdcf2 48%,#bff0fb 100%)', position: 'relative', overflow: 'hidden' }}
    >
      {/* How-to-play trigger (was in the marketing nav; CTA bar removed) */}
      <button
        onClick={() => setShowHelp((v) => !v)}
        style={{ position: 'absolute', top: 20, right: 30, zIndex: 5, fontFamily: "'Baloo 2'", fontWeight: 700, color: '#fff', fontSize: 15, textShadow: '0 1px 0 rgba(40,110,140,.3)' }}
      >
        How to play
      </button>

      {/* ===== decorative sky ===== */}
      <div style={{ position: 'absolute', top: 58, right: '13%', zIndex: 1 }}>
        <div style={{ width: 66, height: 66, borderRadius: 20, background: 'linear-gradient(135deg,#fff2ad,#ffce3a)', boxShadow: '0 7px 0 #e9a400,0 0 0 13px rgba(255,210,63,.16)' }} />
        <div style={{ position: 'absolute', top: -16, left: 24, width: 16, height: 16, borderRadius: 5, background: '#ffd23f', animation: 'sb-floaty 5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: 30, right: -20, width: 13, height: 13, borderRadius: 4, background: '#ffd23f', animation: 'sb-floaty2 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -14, left: 6, width: 11, height: 11, borderRadius: 4, background: '#ffd23f', animation: 'sb-floaty 7s ease-in-out infinite' }} />
      </div>
      {/* drifting cube clouds */}
      <div style={{ position: 'absolute', top: 112, left: 0, zIndex: 1, animation: 'sb-flyLR 62s linear infinite', animationDelay: '-12s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 8, boxShadow: 'inset 0 -7px 0 rgba(200,228,238,.7)' }} />
          <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 11, margin: '0 -5px', boxShadow: 'inset 0 -9px 0 rgba(200,228,238,.7)' }} />
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 9, boxShadow: 'inset 0 -8px 0 rgba(200,228,238,.7)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 200, left: 0, zIndex: 1, animation: 'sb-flyRL 82s linear infinite', animationDelay: '-44s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', transform: 'scale(.82)' }}>
          <div style={{ width: 26, height: 26, background: '#fff', borderRadius: 7, boxShadow: 'inset 0 -6px 0 rgba(200,228,238,.7)' }} />
          <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 10, margin: '0 -4px', boxShadow: 'inset 0 -9px 0 rgba(200,228,238,.7)' }} />
          <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 8, boxShadow: 'inset 0 -7px 0 rgba(200,228,238,.7)' }} />
        </div>
      </div>
      {/* little birds */}
      <div style={{ position: 'absolute', top: 235, left: 0, zIndex: 1, animation: 'sb-flyLR 30s linear infinite', animationDelay: '-6s' }}>
        <div style={{ animation: 'sb-flap 1.1s ease-in-out infinite' }}>
          <svg width="28" height="13" viewBox="0 0 28 13"><path d="M2 9 Q7 2 13 9 Q19 2 26 9" fill="none" stroke="#3a6477" strokeWidth="2.2" strokeLinecap="round" /></svg>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 150, left: 0, zIndex: 1, animation: 'sb-flyRL 34s linear infinite', animationDelay: '-14s' }}>
        <div style={{ animation: 'sb-flap 1.2s ease-in-out infinite', transform: 'scale(.7)' }}>
          <svg width="28" height="13" viewBox="0 0 28 13"><path d="M2 9 Q7 2 13 9 Q19 2 26 9" fill="none" stroke="#3a6477" strokeWidth="2.2" strokeLinecap="round" /></svg>
        </div>
      </div>

      {/* ============ GAME STAGE ============ */}
      <div style={{ position: 'relative', zIndex: 4, maxWidth: 1120, margin: '4px auto 0', padding: '10px 24px 30px' }}>
        {/* island fills the stage on the right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: 540 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {island}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => spin(-1)} aria-label="Rotate left" style={{ width: 54, height: 54, borderRadius: '50%', background: '#fff', color: '#2c7da0', fontSize: 26, fontWeight: 800, boxShadow: '0 5px 0 rgba(70,130,160,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↺</button>
              <span style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 14, color: '#2c7da0', letterSpacing: 1 }}>ROTATE</span>
              <button onClick={() => spin(1)} aria-label="Rotate right" style={{ width: 54, height: 54, borderRadius: '50%', background: '#fff', color: '#2c7da0', fontSize: 26, fontWeight: 800, boxShadow: '0 5px 0 rgba(70,130,160,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↻</button>
            </div>
          </div>
        </div>

        {/* LEFT overlay: blueprint / win popup, controls */}
        <div style={{ position: 'absolute', left: 34, top: '50%', transform: 'translateY(-50%)', width: 372, zIndex: 6 }}>
          {/* shadow blueprint / win message (same spot) */}
          <div style={{ minHeight: 150 }}>
            {!win && (
              <div style={{ display: 'inline-block', position: 'relative', background: 'rgba(255,255,255,.9)', border: '2px dashed #9ec9dc', borderRadius: 22, padding: '8px 18px 10px', boxShadow: '0 8px 22px rgba(60,120,150,.16)', animation: 'sb-floaty 5s ease-in-out infinite' }}>
                <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 11, letterSpacing: 2, color: '#5a93b0', textAlign: 'center', marginBottom: 2 }}>🎯 SHADOW · BUILD THIS</div>
                {blueprint}
              </div>
            )}
            {win && (
              <div style={{ position: 'relative', background: '#fff', border: '2.5px solid #93e08a', borderRadius: 24, padding: '18px 22px', width: 300, boxShadow: '0 12px 30px rgba(50,140,80,.28)', animation: 'sb-popIn .42s cubic-bezier(.34,1.56,.64,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', fontSize: 42, lineHeight: 1 }}>
                    {lv.emoji}
                    <div style={{ position: 'absolute', top: -6, right: -10, color: '#ffd23f', fontSize: 14, animation: 'sb-twinkle 1.6s ease-in-out infinite' }}>★</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 13, color: '#3d9b32', letterSpacing: 2 }}>CORRECT!</div>
                    <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 22, color: '#244a5e', lineHeight: 1.1 }}>It's a {lv.name}!</div>
                  </div>
                </div>
                <button onClick={nextLvl} style={{ width: '100%', marginTop: 14, padding: 13, borderRadius: 16, background: '#5bbf4a', color: '#fff', fontWeight: 800, fontSize: 17, boxShadow: '0 5px 0 #3d9b32' }}>Next level →</button>
              </div>
            )}
          </div>

          {/* controls */}
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 24px', borderRadius: 18, background: '#fff', color: '#2c7da0', fontWeight: 800, fontSize: 16, boxShadow: '0 5px 0 rgba(70,130,160,.3)' }}>↺ Clear</button>
            <button onClick={nextLvl} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 24px', borderRadius: 18, background: '#ffd23f', color: '#5a3d00', fontWeight: 800, fontSize: 16, boxShadow: '0 5px 0 #e0a800' }}>Skip ⏭</button>
          </div>
        </div>
      </div>

      {/* ===== How-to-play drawer ===== */}
      {showHelp && (
        <div>
          <div onClick={() => setShowHelp(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(20,60,80,.4)', animation: 'sb-fadeIn .2s ease' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 50, width: 380, maxWidth: '88vw', height: '100%', background: '#f3fbff', boxShadow: '-12px 0 40px rgba(20,60,80,.25)', animation: 'sb-fadeIn .25s ease', overflowY: 'auto', padding: '30px 28px 40px' }}>
            <button onClick={() => setShowHelp(false)} style={{ position: 'absolute', top: 18, left: -22, width: 44, height: 44, borderRadius: '50%', background: '#ff8a5c', color: '#fff', fontSize: 22, fontWeight: 800, boxShadow: '0 5px 0 #d96a3f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 13, letterSpacing: 1, color: '#2c7da0' }}>HOW TO PLAY</div>
            <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 30, color: '#244a5e', lineHeight: 1.1, margin: '2px 0 22px' }}>Look, build, match!</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 22, padding: 20, boxShadow: '0 8px 0 rgba(70,130,160,.1)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 34, lineHeight: 1 }}>🎯</div>
                <div><div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: '#244a5e', marginBottom: 3 }}>1 · Read the shadow</div><p style={{ fontSize: 14, lineHeight: 1.55, color: '#5a7384', margin: 0 }}>The card on the left shows the target shape as grey blocks. That's what to build.</p></div>
              </div>
              <div style={{ background: '#fff', borderRadius: 22, padding: 20, boxShadow: '0 8px 0 rgba(70,130,160,.1)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 34, lineHeight: 1 }}>🧱</div>
                <div><div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: '#244a5e', marginBottom: 3 }}>2 · Drop your blocks</div><p style={{ fontSize: 14, lineHeight: 1.55, color: '#5a7384', margin: 0 }}>Tap a square on the island to pop a cube up. Tap again to stack it <b>taller</b> — some shapes are 2 or 3 high!</p></div>
              </div>
              <div style={{ background: '#fff', borderRadius: 22, padding: 20, boxShadow: '0 8px 0 rgba(70,130,160,.1)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 34, lineHeight: 1 }}>🎉</div>
                <div><div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 17, color: '#244a5e', marginBottom: 3 }}>3 · Match &amp; reveal</div><p style={{ fontSize: 14, lineHeight: 1.55, color: '#5a7384', margin: 0 }}>Right spots glow <b style={{ color: '#5bbf4a' }}>green</b>, too-short ones <b style={{ color: '#e2b21f' }}>yellow</b>, wrong ones <b style={{ color: '#e3645b' }}>red</b>. Fill it to wake the creature!</p></div>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} style={{ width: '100%', marginTop: 24, padding: 15, borderRadius: 18, background: '#5bbf4a', color: '#fff', fontWeight: 800, fontSize: 17, boxShadow: '0 5px 0 #3d9b32' }}>Got it! Let's play</button>
          </div>
        </div>
      )}
    </div>
  );
}
