// soundEffects.ts
// Sound effects template for challenge MFEs.
// Core sounds are bundled; optional helpers are no-ops until you add assets.

import correctSound from '../assets/sounds/correct.mp3';
import wrongSound from '../assets/sounds/wrong.mp3';
import successSound from '../assets/sounds/success1.mp3';
import timerRunOutSound from '../assets/sounds/timerRunOut.mp3';
import countdownSound from '../assets/sounds/countdown.wav';

const correctAudio = new Audio(correctSound);
const wrongAudio = new Audio(wrongSound);
const successAudio = new Audio(successSound);
const timerRunOutAudio = new Audio(timerRunOutSound);
const countdownAudio = new Audio(countdownSound);

[correctAudio, wrongAudio, successAudio, timerRunOutAudio, countdownAudio].forEach((audio) => {
    audio.preload = 'auto';
    audio.volume = 1.0;
});

function playAudio(audio: HTMLAudioElement): void {
    try {
        audio.currentTime = 0;
        audio.play().catch((err) => {
            console.debug('Could not play sound:', err);
        });
    } catch (err) {
        console.debug('Error playing sound:', err);
    }
}

/** Play correct/match sound */
export function playCorrect(): void {
    playAudio(correctAudio);
}

/** Play wrong/error sound */
export function playWrong(): void {
    playAudio(wrongAudio);
}

/** Play success sound (level complete, big achievement) */
export function playSuccess(): void {
    playAudio(successAudio);
}

/** Play timer run out sound (game over) */
export function playTimerRunOut(): void {
    playAudio(timerRunOutAudio);
}

/**
 * Play countdown sound (for initial game countdown 3, 2, 1)
 * Plays first 4 seconds only (3 seconds for numbers + 1 second for final sound)
 */
export function playCountdown(): void {
    try {
        countdownAudio.currentTime = 0;
        countdownAudio.play().catch((err) => {
            console.debug('Could not play countdown sound:', err);
        });

        setTimeout(() => {
            countdownAudio.pause();
            countdownAudio.currentTime = 0;
        }, 4000);
    } catch (err) {
        console.debug('Error playing countdown sound:', err);
    }
}

export const sfx = {
    correct: playCorrect,
    wrong: playWrong,
    success: playSuccess,
    timerRunOut: playTimerRunOut,
    countdown: playCountdown,
};

export default sfx;
