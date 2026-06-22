import React, { useEffect, useRef, useState } from 'react';
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas';
import { getAssetUrl } from '../utils/assetUrl';
import { useGameStore } from '../store/useGameStore';

// Base display size (matching chef-cake-toppings-addition)
const BASE_WIDTH = 240;
const BASE_HEIGHT = 360;
// Scale factors for different screen sizes
const SCALE_FACTOR_LARGE = 1.3; // For screens >= 900px
const SCALE_FACTOR_SMALL = 0.9; // For screens < 900px (mobile landscape)
const BREAKPOINT = 900;
// Canvas resolution 2x for retina
const CANVAS_WIDTH = BASE_WIDTH * 2;
const CANVAS_HEIGHT = BASE_HEIGHT * 2;

// Hook to get responsive scale factor
const useResponsiveScale = () => {
    const [scaleFactor, setScaleFactor] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < BREAKPOINT ? SCALE_FACTOR_SMALL : SCALE_FACTOR_LARGE;
        }
        return SCALE_FACTOR_LARGE;
    });

    useEffect(() => {
        const handleResize = () => {
            setScaleFactor(window.innerWidth < BREAKPOINT ? SCALE_FACTOR_SMALL : SCALE_FACTOR_LARGE);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return scaleFactor;
};

interface ChefProps {
    className?: string;
    onClick?: () => void;
}

export const Chef: React.FC<ChefProps> = ({ className = '', onClick }) => {
    const { lastMatch, lastError, gamePhase } = useGameStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const riveRef = useRef<Rive | null>(null);
    const [hasEntered, setHasEntered] = useState(false);
    const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastMatchIdRef = useRef<number | null>(null);
    const lastErrorIdRef = useRef<number | null>(null);
    const lastTriggeredAnimationRef = useRef<string | null>(null);
    const scaleFactor = useResponsiveScale();

    // Entrance animation - fade in
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasEntered(true);
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const layout = new Layout({
            fit: Fit.Cover,
            alignment: Alignment.Center,
        });

        riveRef.current = new Rive({
            src: getAssetUrl('/assets/chef_animation.riv'),
            canvas: canvasRef.current,
            layout: layout,
            stateMachines: ['State Machine 1'],
            autoplay: true,
            onLoad: () => {
                riveRef.current?.resizeDrawingSurfaceToCanvas();
                
                // If we're on end screen when Rive loads, trigger happy animation
                const currentPhase = useGameStore.getState().gamePhase;
                if (currentPhase === 'endScreen' || currentPhase === 'gameoverScreen') {
                    setTimeout(() => {
                        console.log('[Chef] 🎊 Rive loaded on end screen - Playing happy');
                        const inputs = riveRef.current?.stateMachineInputs('State Machine 1');
                        if (inputs && inputs.length > 0) {
                            const thanksInput = inputs.find((i: any) => i.name === 'thanks');
                            if (thanksInput && 'fire' in thanksInput) {
                                (thanksInput as any).fire();
                            }
                        }
                    }, 100);
                }
            },
            onLoadError: (error) => {
                console.error('Failed to load chef animation:', error);
            },
        });

        return () => {
            riveRef.current?.cleanup();
        };
    }, []);

    // Trigger animation input by name
    const triggerInput = (inputName: string) => {
        if (!riveRef.current) return;

        // Track what we just triggered
        lastTriggeredAnimationRef.current = inputName;

        try {
            const inputs = riveRef.current.stateMachineInputs('State Machine 1');
            if (inputs && inputs.length > 0) {
                const input = inputs.find((i: any) => i.name === inputName);
                if (input && 'fire' in input) {
                    (input as any).fire();
                    console.log(`[Chef] ✅ Triggered ${inputName} animation`);
                } else {
                    console.warn(`[Chef] Input '${inputName}' not found. Available:`, inputs.map((i: any) => i.name));
                }
            }
        } catch (e) {
            console.warn('[Chef] Could not trigger input:', e);
        }
    };

    // Reset Rive to Entry State by cleaning up and recreating the instance
    // This properly resets to idle state and allows new transitions to work
    const resetToIdle = () => {
        if (!riveRef.current || !canvasRef.current) return;

        console.log('[Chef] 🔄 Resetting to idle state by recreating Rive instance');

        // Track that we reset
        lastTriggeredAnimationRef.current = 'idle';

        // Clean up old instance
        riveRef.current.cleanup();

        // Create fresh Rive instance
        const layout = new Layout({
            fit: Fit.Cover,
            alignment: Alignment.Center,
        });

        riveRef.current = new Rive({
            src: getAssetUrl('/assets/chef_animation.riv'),
            canvas: canvasRef.current,
            layout: layout,
            stateMachines: ['State Machine 1'],
            autoplay: true,
            onLoad: () => {
                riveRef.current?.resizeDrawingSurfaceToCanvas();
                console.log('[Chef] ✅ Rive instance recreated - now in idle state');
            },
        });
    };

    // Trigger 'thanks' animation when player makes a match, reset to idle after 3 seconds
    useEffect(() => {
        if (lastMatch && riveRef.current && gamePhase === 'playing') {
            // Only trigger if this is a new match (different ID)
            if (lastMatchIdRef.current === lastMatch.id) return;
            lastMatchIdRef.current = lastMatch.id;

            // Clear any existing reset timer
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
                resetTimerRef.current = null;
            }

            console.log('[Chef] 🎉 Match! Playing thanks');

            // If coming from another animation (not idle), reset to idle first then trigger
            const currentAnim = lastTriggeredAnimationRef.current;
            if (currentAnim && currentAnim !== 'idle' && currentAnim !== 'thanks') {
                console.log(`[Chef] 🔄 Resetting to idle first before thanks (was ${currentAnim})`);
                resetToIdle();
                setTimeout(() => {
                    if (riveRef.current) {
                        triggerInput('thanks');
                    }
                }, 150);
            } else {
                triggerInput('thanks');
            }

            // Reset to idle state after 3 seconds
            resetTimerRef.current = setTimeout(() => {
                if (gamePhase === 'playing' && riveRef.current) {
                    resetToIdle();
                    resetTimerRef.current = null;
                }
            }, 3000);
        }
    }, [lastMatch, gamePhase]);

    // Trigger 'confuse' animation for errors, reset to idle after 3 seconds
    useEffect(() => {
        if (lastError && riveRef.current && gamePhase === 'playing') {
            // Only trigger if this is a new error (different ID)
            if (lastErrorIdRef.current === lastError.id) return;
            lastErrorIdRef.current = lastError.id;

            // Clear any existing reset timer
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
                resetTimerRef.current = null;
            }

            console.log('[Chef] ❌ Error! Playing confuse');

            // If coming from another animation (not idle), reset to idle first then trigger
            const currentAnim = lastTriggeredAnimationRef.current;
            if (currentAnim && currentAnim !== 'idle' && currentAnim !== 'confuse') {
                console.log(`[Chef] 🔄 Resetting to idle first before confuse (was ${currentAnim})`);
                resetToIdle();
                setTimeout(() => {
                    if (riveRef.current) {
                        triggerInput('confuse');
                    }
                }, 150);
            } else {
                triggerInput('confuse');
            }

            // Reset to idle state after 3 seconds
            resetTimerRef.current = setTimeout(() => {
                if (gamePhase === 'playing' && riveRef.current) {
                    resetToIdle();
                    resetTimerRef.current = null;
                }
            }, 3000);
        }
    }, [lastError, gamePhase]);

    // Trigger 'thanks' animation on end screen (stays happy)
    useEffect(() => {
        if ((gamePhase === 'endScreen' || gamePhase === 'gameoverScreen') && riveRef.current) {
            // Clear any reset timer
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
                resetTimerRef.current = null;
            }

            console.log('[Chef] 🎊 End screen - Playing happy (thanks)');

            // If coming from another animation (like confuse), reset to idle first
            const currentAnim = lastTriggeredAnimationRef.current;
            if (currentAnim && currentAnim !== 'idle' && currentAnim !== 'thanks') {
                console.log(`[Chef] 🔄 Going to idle first before end screen thanks (was ${currentAnim})`);
                resetToIdle();
                setTimeout(() => {
                    if (riveRef.current) {
                        triggerInput('thanks');
                    }
                }, 150);
            } else {
                triggerInput('thanks');
            }
        }
    }, [gamePhase]);

    return (
        <div
            className={`relative group ${className}`}
            style={{
                width: `${BASE_WIDTH * scaleFactor}px`,
                height: `${BASE_HEIGHT * scaleFactor}px`,
                cursor: onClick ? 'pointer' : 'default',
                opacity: hasEntered ? 1 : 0,
                transition: 'opacity 0.5s ease-out, width 0.3s ease, height 0.3s ease',
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="drop-shadow-lg"
                style={{
                    width: `${BASE_WIDTH}px`,
                    height: `${BASE_HEIGHT}px`,
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.3s ease',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))'
                }}
            />
        </div>
    );
};

export default Chef;
