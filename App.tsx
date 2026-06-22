import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Chef } from './components/Chef';
import { SpeechBubble } from './components/SpeechBubble';
import { IntroScreen } from './components/IntroScreen';
import { TopBar } from './components/TopBar';
import { ScoreDisplay } from './components/ScoreDisplay';
import { CountdownLayer } from './components/CountdownLayer';
import { GameOverScreen } from './components/GameOverScreen';
import { GameOverLayer } from './components/GameOverLayer';
import { PauseModal } from './components/PauseModal';
import GameScreen from './components/GameScreen';
import { useGameStore } from './store/useGameStore';
import { strings } from './strings';
import { playCorrect, playWrong, playSuccess } from './utils/soundEffects';
import { challengeProgressService } from './services/challengeProgressService';

const CHEF_BASE_WIDTH = 240;
const SCALE_LARGE = 1.3;
const SCALE_SMALL = 0.9;
const SCREEN_BREAKPOINT = 900;
const BUBBLE_GAP = 10;

// Chef-narrated tutorial shown at the start of play (explains the colour code).
const TUTORIAL_LINES = [
  strings.tutorial.tap,
  strings.tutorial.green,
  strings.tutorial.yellow,
  strings.tutorial.red,
  strings.tutorial.match,
];
const TUTORIAL_STEP_MS = 3800;

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div
      className="flex h-screen items-center justify-center p-6"
      style={{ backgroundColor: '#fef5e4', fontFamily: "'Gabarito', Helvetica, sans-serif" }}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[#E4E4E4] bg-white p-8 text-center"
        style={{ boxShadow: '0px 8px 0px 0px rgba(228, 228, 228, 1)' }}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFECDA] text-2xl">!</div>
        <h2 className="mb-3 text-2xl font-black text-[#000D26]">Something went wrong</h2>
        <p className="mb-6 break-words text-sm leading-6 text-[#3A2B1F]">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="rounded-full px-7 py-3 font-bold text-white transition-transform active:translate-y-[2px]"
          style={{ backgroundColor: '#ED8849', boxShadow: '0px 4px 0px 0px #C86D32' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

interface StarterScreenProps {
  eventBus?: {
    emit: (event: string, data: any) => void;
    on: (event: string, callback: (data: any) => void) => () => void;
  } | null;
}

function StarterScreen({ eventBus }: StarterScreenProps) {
  const {
    gamePhase,
    score,
    timeLeft,
    tickTimer,
    startPlaying,
    pauseGame,
    resumeGame,
    resetGame,
    endGame,
    setGamePhase,
  } = useGameStore();

  const [isSmallScreen, setIsSmallScreen] = React.useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < SCREEN_BREAKPOINT;
    return false;
  });
  const [feedbackState, setFeedbackState] = React.useState<'idle' | 'correct' | 'wrong' | 'success'>('idle');
  const [feedbackNonce, setFeedbackNonce] = React.useState(0);
  const [tutorialStep, setTutorialStep] = React.useState(-1);
  const [speechVisible, setSpeechVisible] = React.useState(true);

  React.useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < SCREEN_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (gamePhase !== 'playing') return;
    const interval = window.setInterval(() => {
      const previousTime = useGameStore.getState().timeLeft;
      tickTimer();
      const nextState = useGameStore.getState();
      if (previousTime > 0 && nextState.timeLeft === 0) {
        challengeProgressService.saveGameSession({
          score: nextState.score,
          levelsCompleted: 1,
          timePlayed: 60,
          completedAt: new Date().toISOString(),
        });
        emitMfeEvent('mfe:game-over', { score: nextState.score, timeRemaining: 0 });
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [gamePhase, tickTimer]);

  // Chef walks through the tutorial lines once at the start of each play session.
  React.useEffect(() => {
    if (gamePhase !== 'playing') {
      setTutorialStep(-1);
      return;
    }
    setTutorialStep(0);
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      if (step >= TUTORIAL_LINES.length) {
        setTutorialStep(-1);
        window.clearInterval(id);
      } else {
        setTutorialStep(step);
      }
    }, TUTORIAL_STEP_MS);
    return () => window.clearInterval(id);
  }, [gamePhase]);

  React.useEffect(() => {
    if (gamePhase !== 'gameoverScreen') return;
    const timeout = window.setTimeout(() => {
      setGamePhase('endScreen');
      emitMfeEvent('mfe:game-complete-ready', { score });
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [gamePhase, setGamePhase]);

  const chefWidth = CHEF_BASE_WIDTH * (isSmallScreen ? SCALE_SMALL : SCALE_LARGE);
  const smallScreenOffset = isSmallScreen ? 5 : 0;
  const nonPeekingOffset = -40;
  const peekingOffset = isSmallScreen ? -90 : -120;
  const isPeeking = gamePhase !== 'intro' && gamePhase !== 'endScreen';
  const inTutorial = gamePhase === 'playing' && tutorialStep >= 0 && tutorialStep < TUTORIAL_LINES.length;
  const currentSpeech = feedbackState === 'correct'
    ? strings.feedback.correct
    : feedbackState === 'wrong'
      ? strings.feedback.wrong
      : feedbackState === 'success'
        ? strings.feedback.success
        : inTutorial
          ? TUTORIAL_LINES[tutorialStep]
          : strings.intro.welcome;
  const isIntro = gamePhase === 'intro';
  const isGameEnding = gamePhase === 'gameoverScreen' || gamePhase === 'endScreen';
  const shouldHideSpeech = gamePhase === 'countdown' || isIntro || isGameEnding;

  React.useEffect(() => {
    if (shouldHideSpeech) {
      setSpeechVisible(false);
      return;
    }

    setSpeechVisible(true);

    if (feedbackState !== 'idle') {
      const timeout = window.setTimeout(() => {
        setSpeechVisible(false);
      }, 3000);
      return () => window.clearTimeout(timeout);
    }
  }, [currentSpeech, feedbackState, feedbackNonce, shouldHideSpeech]);

  const emitMfeEvent = (event: string, data: Record<string, unknown> = {}) => {
    eventBus?.emit(event, data);
  };

  const handleStartPlaying = () => {
    startPlaying();
    emitMfeEvent('mfe:game-started', { phase: 'playing' });
  };

  const handlePause = () => {
    pauseGame();
    emitMfeEvent('mfe:game-paused', { phase: gamePhase, timeRemaining: timeLeft, score });
  };

  const handleResume = () => {
    resumeGame();
    emitMfeEvent('mfe:game-resumed', { phase: 'playing', timeRemaining: timeLeft, score });
  };

  const handleRestart = () => {
    resetGame();
    setFeedbackState('idle');
    emitMfeEvent('mfe:game-restarted', { phase: 'intro' });
  };

  const handleEndGame = () => {
    challengeProgressService.saveGameSession({
      score,
      levelsCompleted: 1,
      timePlayed: 60 - timeLeft,
      completedAt: new Date().toISOString(),
    });
    endGame();
    emitMfeEvent('mfe:game-over', { score, timeRemaining: timeLeft });
  };

  const triggerCorrect = () => {
    playCorrect();
    useGameStore.getState().incrementScore(1);
    setFeedbackState('correct');
    emitMfeEvent('mfe:game-feedback', { state: 'correct', score: useGameStore.getState().score });
  };

  const triggerWrong = () => {
    playWrong();
    setFeedbackState('wrong');
    emitMfeEvent('mfe:game-feedback', { state: 'wrong', score });
  };

  const triggerSuccess = () => {
    playSuccess();
    setFeedbackState('success');
    handleEndGame();
  };

  // Called by GameScreen each time a level's shape matches its shadow. Deferred
  // to a macrotask because GameScreen invokes it from inside a state updater.
  const handleLevelComplete = () => {
    window.setTimeout(() => {
      playCorrect();
      useGameStore.getState().incrementScore(1);
      setTutorialStep(-1);
      setFeedbackState('correct');
      setFeedbackNonce((n) => n + 1);
    }, 0);
  };

  const bubbleStyle: React.CSSProperties = {
    left: `${10 + chefWidth + BUBBLE_GAP - 80 + smallScreenOffset + (isPeeking ? peekingOffset : nonPeekingOffset)}px`,
    bottom: '20px',
    transition: 'left 0.5s ease-in-out',
  };

  return (
    <div
      id="shadow-builder-root"
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundColor: '#fef5e4',
        fontFamily: "'Gabarito', Helvetica, sans-serif",
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {!isIntro && (
        <TopBar
          timeRemaining={timeLeft}
          isPaused={gamePhase === 'paused'}
          onPause={handlePause}
          onRestart={handleRestart}
        />
      )}
      {!isIntro && <ScoreDisplay />}

      {gamePhase === 'playing' && (
       <GameScreen onLevelComplete={handleLevelComplete} />
      )}




      {!isIntro && !isGameEnding && (
        <div
          className="pointer-events-auto absolute z-[102] transition-all duration-500 ease-in-out"
          style={{
            bottom: '0px',
            left: isPeeking ? (isSmallScreen ? '-90px' : '-120px') : '-40px',
          }}
        >
          <Chef />
        </div>
      )}

      {!shouldHideSpeech && speechVisible && (
        <div
          id="speech-bubble-container"
          className="pointer-events-none absolute inset-0 z-[101] h-full w-full opacity-100 transition-opacity duration-500"
        >
          <SpeechBubble text={currentSpeech} style={bubbleStyle} isTyping={false} />
        </div>
      )}

      {gamePhase === 'intro' && <IntroScreen />}
      {gamePhase === 'countdown' && <CountdownLayer />}
      {gamePhase === 'paused' && (
        <PauseModal
          isVisible={true}
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={() => emitMfeEvent('mfe:quit-challenge', {})}
        />
      )}
      {gamePhase === 'gameoverScreen' && <GameOverScreen />}
      {gamePhase === 'endScreen' && <GameOverLayer eventBus={eventBus} />}
    </div>
  );
}

interface AppProps {
  eventBus?: StarterScreenProps['eventBus'];
}

// Global 20% down-scale: the layout that looked right at 80% browser zoom is now
// the default 100% view. The inner layer is 125% of the viewport and scaled to
// 0.8 (125% × 0.8 = 100%), so everything renders ~20% smaller with no gaps. The
// transform also makes this the containing block for the app's fixed overlays,
// so countdown / game-over / end screens still fill the screen correctly.
const UI_SCALE = 0.8;

export default function App({ eventBus }: AppProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${100 / UI_SCALE}vw`,
            height: `${100 / UI_SCALE}vh`,
            zoom: UI_SCALE,
          }}
        >
          <StarterScreen eventBus={eventBus} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
