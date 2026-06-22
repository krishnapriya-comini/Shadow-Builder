# Detailed prompt: create a new challenge from this starter kit

Use this prompt with a coding agent:

```text
You are creating a new Comini Lab challenge MFE from the `challenge-starter-kit` folder.

Read and follow `/home/harikrishnan/coding/comini-lab-frontend/.agents/skills/game-development/SKILL.md` first. Do not hallucinate starter files. Copy the files that already exist in `challenge-starter-kit` and adapt them.

New challenge details:
- Challenge ID: <kebab-case-id>
- Challenge title: <human title>
- Component name: <PascalCaseName>
- Storage prefix: <short_prefix_>
- Learning goal: <concept>
- Primary concept: <concept>
- Secondary concept: <optional concept>
- Story context: <setting>
- Item singular/plural: <item>/<items>
- Task singular/plural: <task>/<tasks>
- Game tool: <tool>
- Audio base URL: <url or TODO>

Steps:
1. Copy the full `challenge-starter-kit` folder to the new challenge folder.
2. Replace all `{{...}}` placeholders using `template.config.json` values.
3. Keep MFE integration from `services/challengeProgressService.ts` and the MFE entry pattern.
4. Keep shared Chef, SpeechBubble, countdown, pause, game-over, end-screen, and reflections components unless the new game explicitly needs different behavior.
5. Replace only game-specific logic, assets, strings, and types.
6. Update `package.json` name and MFE scripts/ports if needed.
7. Update `strings.ts`, `types.ts`, `store/useGameStore.ts`, and `App.tsx` for the new mechanics.
8. Remove the centered starter/demo panel in `App.tsx` with preview buttons (`Preview play`, `Correct state`, `Wrong state`, `Success / end`). It exists only to validate starter wiring and must be replaced by the real challenge gameplay screen/board.
9. Search for remaining hardcoded source-game terms and unresolved placeholders: `{{`, `dinner`, `recipe`, `ingredient`, `weight`, `scale`, `dinner_prep`, `dp_`.
10. Preserve progress events: `mfe:request-progress`, `mfe:progress-updated`, `mfe:game-complete`, and `mfe:quit-challenge`.
11. Do not start dev servers unless explicitly asked.

Acceptance checks:
- No unresolved `{{...}}` placeholders remain unless intentionally documented as TODOs.
- Challenge ID is kebab-case and consistent across package, progress service, MFE entry, and emitted events.
- User-facing messages are specific to the new challenge.
- The starter/demo panel and preview buttons are removed from the shipped challenge.
- Reusable copied components remain functional and are not rewritten from scratch.
```
