# Dragster coding assets

Source: `src/lessons/dragster/coding-stages.json`, based on physical PDF pages 15 and 18 of the user-supplied Session 30 Dragster PDF.

- Guided stages 1–4 are labelled intermediate programs.
- Guided stage 5 combines the two supplied programs without additional commands: Button A sends motor A 100 / B -100; startup creates an 8-LED RGB (GRB) strip on P16; forever selects black for light > 100 and white otherwise. Both explicit `strip.show()` calls are retained.
- Stages 6–9 are independent, optional experiments. Each `code` field is complete. They do not replace the reference in stage 5.
- Focus images for stages 3–9 are excerpts. Stage 5/9 focus sources declare `strip` as null only to let the renderer type-check the loop excerpt; use the complete program's P16 initialization when building or running.
- Hardware class: Microbit. Motors: Bricks4Kidz v1.4.1. LEDs: Microsoft NeoPixel v0.7.6. Both exact package identifiers are recorded in the manifest and rendering provenance.

Regenerate using the installed LogicLabs progressive coding skill:

```sh
node <skill>/scripts/render-blocks.cjs src/lessons/dragster/coding-stages.json src/assets/dragster/code
node <skill>/scripts/compose-cards.mjs src/lessons/dragster/coding-stages.json src/assets/dragster/code
npm run build:playground
```

The first command needs the official MakeCode renderer and network access. Composition and classroom builds use the cached artwork offline. Keep raw SVG/PNG exports, their TypeScript sources, provenance, and the editable SVG teaching cards together.

The viewer uses raw close-ups and full-program exports; teaching cards add prediction, observation, and explanation prompts. Routine classroom builds copy all nine stages to `docs/assets/dragster-code/`.

Validation covers renderer/decompiler acceptance, command order and reference equality in a mocked runtime, threshold boundaries (100/101 and 150/151), and browser navigation/layout. These checks do not establish physical motor direction, speed, LED wiring, scheduler behaviour during overlapping presses, or actual one-second timing. Test with the physical build; for timed experiments, wait for a run to finish before restarting.
