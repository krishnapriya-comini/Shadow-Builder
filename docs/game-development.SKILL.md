---
name: game-development
description: "Creates educational games for Comini Lab Frontend. Use when building new games, implementing game phases, adding Chef/SpeechBubble components, setting up Zustand stores, or integrating MFE progress tracking."
---

# Game Development Skill - Comini Lab Frontend

Creates educational games following established patterns from dinner-prep, chef-cake-toppings-addition, place-value-farm, and garden-planning.

## Project Structure

Every game follows this structure:

```
your-game-name/
├── src/
│   ├── App.tsx                    # Main app entry point
│   ├── main.tsx                   # React DOM render
│   ├── index.css                  # Global styles (Tailwind)
│   ├── strings.ts                 # All localized text
│   ├── types.ts                   # TypeScript interfaces
│   ├── components/
│   │   ├── GameScreen.tsx         # Main game orchestrator
│   │   ├── Chef.tsx               # Rive-animated character
│   │   ├── SpeechBubble.tsx       # Chef dialogue bubble
│   │   ├── CountdownLayer.tsx     # 3-2-1 countdown
│   │   ├── GameOverScreen.tsx     # "Time's up!" display
│   │   ├── GameOverLayer.tsx      # Final score & buttons
│   │   ├── ReflectionsScreen.tsx  # Achievement summary
│   │   ├── ReadyButtons.tsx       # "I'm Ready!" buttons
│   │   ├── TopBar.tsx             # Pause/Retry buttons
│   │   ├── PauseModal.tsx         # Pause menu overlay
│   │   ├── BaseButton.tsx         # Reusable styled button
│   │   └── [Game-specific components]
│   ├── store/
│   │   └── useGameStore.ts        # Zustand state management
│   ├── services/
│   │   └── challengeProgressService.ts  # Progress persistence
│   └── utils/
│       ├── VoiceOverManager.ts    # Voice-over audio system
│       ├── soundEffects.ts        # Sound effects management
│       └── assetUrl.ts            # MFE asset URL resolver
├── public/assets/
│   ├── chef_animation.riv         # Chef Rive animation
│   ├── hand.svg                   # Tutorial hand pointer
│   └── [Game assets]
```

## Game Phases & Flow

```
INTRO → COUNTDOWN → PLAYING → GAMEOVER_SCREEN → END_SCREEN → REFLECTIONS
         (3-2-1)     (60s)       (2s auto)      (buttons)    (stars)
```

### Phase Definitions

| Phase | Description | Duration |
|-------|-------------|----------|
| `intro` | Tutorial steps for new users | Voice-over driven |
| `countdown` | 3-2-1 countdown | 3 seconds |
| `playing` | Active gameplay with timer | 60 seconds |
| `paused` | Game paused via pause button | Until resumed |
| `gameoverScreen` | "Time's up!" display | 2 seconds |
| `endScreen` | Final score with buttons | Until user action |
| `reflections` | Achievement card with stars | Until checkmark clicked |

### TypeScript Type

```typescript
export type GamePhase =
  | 'intro'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'gameoverScreen'
  | 'endScreen';
```

## Essential Components

### Chef Component
Rive-animated character with states: `idle`, `happy/thanks`, `confused/confuse`

```tsx
<Chef className="absolute bottom-0" />

// Positioning: Normal vs Peek View
const nonPeekingOffset = -40;  // Intro/EndScreen
const peekingOffset = isSmallScreen ? -90 : -120;  // During Gameplay
```

### SpeechBubble Component
Dynamic dialogue bubble (100-260px width, auto-sizing)

```tsx
<SpeechBubble text={currentSpeech} style={bubbleStyle} isTyping={false} />
```

### CountdownLayer Component
3-2-1 countdown with sound effects, auto-transitions to `playing`

## Zustand Store Template

```typescript
import { create } from 'zustand';

interface GameState {
  gamePhase: GamePhase;
  score: number;
  timeLeft: number;
  introStep: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  incrementScore: (points?: number) => void;
  setTimeLeft: (time: number) => void;
  nextIntroStep: () => void;
  startCountdown: () => void;
  startPlaying: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gamePhase: 'intro',
  score: 0,
  timeLeft: 60,
  introStep: 0,
  soundEnabled: true,
  musicEnabled: true,

  setGamePhase: (phase) => set({ gamePhase: phase }),
  incrementScore: (points = 1) => set((s) => ({ score: s.score + points })),
  setTimeLeft: (time) => set({ timeLeft: time }),
  nextIntroStep: () => set((s) => ({ introStep: s.introStep + 1 })),
  startCountdown: () => set({ gamePhase: 'countdown' }),
  startPlaying: () => set({ gamePhase: 'playing', timeLeft: 60 }),
  pauseGame: () => set({ gamePhase: 'paused' }),
  resumeGame: () => set({ gamePhase: 'playing' }),
  endGame: () => set({ gamePhase: 'gameoverScreen' }),
  resetGame: () => set({ gamePhase: 'intro', score: 0, timeLeft: 60, introStep: 0 }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
}));
```

## Progress Tracking & MFE Integration

### Progress Service Setup

```typescript
// In mfe-entry.tsx mount()
if (eventBus) {
  challengeProgressService.setEventBus(eventBus);
  eventBus.emit('mfe:request-progress', { challengeId: 'your-game' });
}

// In mfe-entry.tsx unmount()
challengeProgressService.cleanup();
```

### Save Progress (when timer ends)

```typescript
challengeProgressService.saveGameSession({
  score,
  maxScore: 100,
  levelReached: 1,
});
```

### EventBus Events

| Event | When | Payload |
|-------|------|---------|
| `mfe:request-progress` | On mount | `{ challengeId }` |
| `mfe:progress-updated` | After game session | `{ challengeId, progress }` |
| `mfe:game-complete` | User clicks "Later" | `{ challengeId, progress }` |
| `mfe:quit-challenge` | User quits or after game-complete | none |

## Files to Copy When Starting New Game

Copy common files from existing games in this repo. Reference games:
- `dinner-prep/` - Most complete reference
- `chef-cake-toppings-addition/` - Good for Chef animations
- `place-value-farm/` - Good for complex game logic
- `garden-planning/` - Good for drag-and-drop mechanics
- `snack-time/` - Good for simple game structure
- `bake-store/` - Good for MFE integration

### Copy these files from any existing game:

**From `dinner-prep/src/components/` (or similar game):**
```bash
# Core components
Chef.tsx
SpeechBubble.tsx
CountdownLayer.tsx
GameOverScreen.tsx
GameOverLayer.tsx
ReflectionsScreen.tsx
ReadyButtons.tsx
BaseButton.tsx
TopBar.tsx
PauseModal.tsx
AchievementCard.tsx
CheckmarkButton.tsx
StarRating.tsx
```

**From `dinner-prep/src/utils/`:**
```bash
VoiceOverManager.ts
soundEffects.ts
assetUrl.ts
```

**From `dinner-prep/src/services/`:**
```bash
challengeProgressService.ts
```

**From `dinner-prep/public/assets/`:**
```bash
chef_animation.riv
hand.svg
```

### Quick Copy Commands

```bash
# Create new game folder
mkdir -p your-game-name/src/{components,store,services,utils} your-game-name/public/assets

# Copy common components from dinner-prep (adjust source game as needed)
cp dinner-prep/src/components/{Chef,SpeechBubble,CountdownLayer,GameOverScreen,GameOverLayer,ReflectionsScreen,ReadyButtons,BaseButton,TopBar,PauseModal,AchievementCard,CheckmarkButton,StarRating}.tsx your-game-name/src/components/

# Copy utilities
cp dinner-prep/src/utils/{VoiceOverManager,soundEffects,assetUrl}.ts your-game-name/src/utils/

# Copy services
cp dinner-prep/src/services/challengeProgressService.ts your-game-name/src/services/

# Copy assets
cp dinner-prep/public/assets/{chef_animation.riv,hand.svg} your-game-name/public/assets/

# Copy config files
cp dinner-prep/{package.json,vite.config.ts,tsconfig.json,tailwind.config.js} your-game-name/
```

### After Copying

1. Update `package.json` with new game name
2. Update `challengeProgressService.ts` with new `CHALLENGE_ID`
3. Create `strings.ts` with game-specific text
4. Create `types.ts` with game-specific interfaces
5. Create `useGameStore.ts` with game-specific state
6. Build your game-specific components

## Capacitor Background/Pause Handling

Games must handle app going to background (mobile) and tab visibility changes (web) to:
- Pause game timers
- Pause/stop audio
- Show pause modal (optional)
- Track session time

### Setup App State Listeners (in main.tsx or App.tsx)

```typescript
// For Capacitor (mobile apps)
import { App } from '@capacitor/app';

// Listen for app state changes
App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    window.dispatchEvent(new CustomEvent('app:foreground'));
  } else {
    window.dispatchEvent(new CustomEvent('app:background'));
  }
});

// For web browsers - use visibilitychange
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.dispatchEvent(new CustomEvent('app:background'));
  } else {
    window.dispatchEvent(new CustomEvent('app:foreground'));
  }
});
```

### Handle Background/Foreground in GameScreen

```typescript
// Track if pause was triggered by background
let isBackgroundPaused = false;

function pauseForBackground() {
  // Skip if already paused
  if (isBackgroundPaused) return;
  
  // Skip during auth screens or intro
  if (gamePhase === 'intro') return;
  
  // Pause game state
  if (gamePhase === 'playing') {
    pauseGame();
    isBackgroundPaused = true;
    
    // Stop all audio
    soundManager.pauseAllAudio();
    
    // Optional: Show pause modal
    setShowPauseModal(true);
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    pauseForBackground();
  } else {
    // Clear background pause flag
    isBackgroundPaused = false;
    
    // Auto-resume for certain screens (sections, story panels)
    // Or let user manually resume via pause modal
  }
}

useEffect(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('app:background', pauseForBackground);
  window.addEventListener('app:foreground', () => {
    isBackgroundPaused = false;
  });
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    // ... cleanup other listeners
  };
}, []);
```

### Key Patterns

| Scenario | Behavior |
|----------|----------|
| Tab hidden during gameplay | Pause game, stop audio, show pause modal |
| Tab hidden during intro | Pause audio only (no modal) |
| Tab hidden during auth screens | Skip pause handling entirely |
| App goes to background (mobile) | Same as tab hidden |
| Return to app | Clear background flag, wait for user to resume |

### Cordova Fallback (if Capacitor not available)

```typescript
// Fallback for older Cordova apps
document.addEventListener('pause', () => {
  window.dispatchEvent(new CustomEvent('app:background'));
}, false);

document.addEventListener('resume', () => {
  window.dispatchEvent(new CustomEvent('app:foreground'));
}, false);
```

### Audio Handling

```typescript
// Pause all audio when going to background
soundManager.pauseAllAudio();

// Resume audio when coming back (if auto-resume screen)
soundManager.resumeAllAudio();
```

## Best Practices

### Naming
- Components: PascalCase (`GameScreen.tsx`)
- Hooks: camelCase with `use` prefix (`useGameStore.ts`)
- Challenge IDs: kebab-case (`dinner-prep`, `snack-time`)

### State Management
- Zustand for global game state
- Component-local state for UI-only concerns
- Refs for values that shouldn't trigger re-renders

### Animations
- Framer Motion for complex animations
- CSS transitions for simple effects
- Animate `opacity` and `transform` for performance

### Responsive Design
- 900px as mobile/desktop breakpoint
- Scale Chef and UI proportionally
- Test landscape and portrait orientations

### Performance
- Memoize expensive calculations
- `React.memo` for pure components
- Preload audio files
- Lazy load heavy assets

### Progress Tracking
- Always save progress when timer ends
- Use `challengeProgressService.saveGameSession()`
- Test in both standalone and MFE modes
