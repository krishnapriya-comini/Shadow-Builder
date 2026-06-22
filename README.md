# Challenge Starter Kit

This starter kit was created from real Comini Lab challenge MFE files on `main`, using `.agents/skills/game-development/SKILL.md` as the source of truth. Files were copied from existing challenge MFEs, primarily `dinner-prep`, instead of being invented.

## Source references analyzed

Challenge MFEs considered: `big-party-order`, `chef-cake-toppings-addition`, `dinner-prep`, `farmers-market`, `garden-planning`, `grammys-shopping`, `library-books`, `place-value-farm`, `snack-time`, `test-react-game-mfe`, `the-savings-jar`, `the-school-order`, `the-scool-order`.

Excluded non-challenge/reference MFEs: `bake-store`, `giffie-mfe`, `ripples-mfe`, `katha-mfe`.

Main copied source: `dinner-prep`, because the game-development skill names it the most complete reference.

## What to copy for a new challenge

Copy this whole folder to a new repository or folder, then replace the placeholders listed in `template.config.json`.

Core files:
- `App.tsx`
- `index.tsx`
- `index.html`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.css`
- `strings.ts`
- `types.ts`
- `audio.d.ts`

Shared components copied from `dinner-prep/components`:
- `Chef.tsx`
- `SpeechBubble.tsx`
- `CountdownLayer.tsx`
- `GameOverScreen.tsx`
- `GameOverLayer.tsx`
- `ReflectionsScreen.tsx`
- `ReadyButtons.tsx`
- `BaseButton.tsx`
- `TopBar.tsx`
- `PauseModal.tsx`
- `AchievementCard.tsx`
- `StarRating.tsx`

Shared utilities/services:
- `utils/VoiceOverManager.ts`
- `utils/soundEffects.ts`
- `utils/assetUrl.ts`
- `services/challengeProgressService.ts`
- `store/useGameStore.ts`

Assets:
- `public/assets/chef_animation.riv`
- `public/assets/hand.svg`

## Placeholder policy

Hardcoded concept/story terms were replaced with placeholders such as:

- `{{CHALLENGE_ID}}`
- `{{CHALLENGE_TITLE}}`
- `{{CHALLENGE_COMPONENT_NAME}}`
- `{{STORAGE_PREFIX}}`
- `{{LEARNING_GOAL}}`
- `{{PRIMARY_CONCEPT}}`
- `{{SECONDARY_CONCEPT}}`
- `{{CHALLENGE_CONTEXT}}`
- `{{ITEM_NAME}}`, `{{ITEM_NAME_PLURAL}}`
- `{{TASK_NAME}}`, `{{TASK_NAME_PLURAL}}`
- `{{GAME_TOOL}}`

Search for `{{` after copying and replace every placeholder before building.

## Converting the starter shell into a real challenge

`App.tsx` intentionally includes a centered starter/demo panel with preview buttons such as `Preview play`, `Correct state`, `Wrong state`, and `Success / end`. This panel is only for validating shared starter-kit wiring: Chef positioning, speech bubble positioning, timer/top-bar behavior, SFX playback, end-screen flow, reflections, and MFE events.

When building a real challenge, remove that centered demo panel entirely and replace it with the actual gameplay screen/board. Do not ship the starter panel or its preview buttons in a real challenge. Keep the reusable surrounding systems unless the new challenge has a deliberate replacement:

- Chef and SpeechBubble positioning
- TopBar pause/retry controls
- ScoreDisplay timer/score behavior
- Countdown, game-over, end-screen, and reflections flow
- common SFX hooks
- MFE progress/lifecycle events
