# Earth Quake Alert coding

Microbit-only Coding tab. BrickX keeps its existing Nezha motor program.

`coding-stages.json` is the editable curriculum and complete MakeCode TypeScript source for each stage. The endpoint follows the supplied standalone reference: 3g/6g/8g gestures, lights/sounds, `MaxShake`, `updateMax`, A reset, and B readout. The final stage adds a busy flag to prevent overlapping display/sound sequences. Incoming gesture thresholds still update the saved record while busy; A/B presses while busy are ignored and should be repeated afterwards.

The earlier radio-send reference needs a receiver and is not part of the supplied standalone final program. No hardware extension is required for these built-in MakeCode blocks.

## Meaning of the reading

`MaxShake` holds the highest triggered threshold (3000, 6000, 8000 milli-g), not a continuously sampled acceleration peak. B divides by 1000 to display g. `Peak Force:` preserves the supplied reference label; neither this label nor g is earthquake magnitude, and force is not measured in g. The teaching-card footnote explains the threshold approximation.

Test threshold gestures through the MakeCode simulator. Do not throw or strike a physical board to reach high-g events. Audio on a board depends on speaker/buzzer hardware. Physical board behavior has not been verified here.

## Authentic assets and regeneration

`src/assets/earth_quake_alert/code/rendered/` contains official renderer SVG/PNG exports, exact source and provenance. Top-level PNG/SVG files are editable teaching-card compositions, with close-ups and complete references for all ten stages. Default-zero initialization may be omitted by MakeCode decompilation; startup explicitly assigns zero after showing the ready face so it remains visible in the blocks.

Use the installed `logiclabs-progressive-coding` skill helpers:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright-core node /Users/abisoye/.codex/skills/logiclabs-progressive-coding/scripts/render-blocks.cjs src/lessons/earth-quake-alert/coding-stages.json src/assets/earth_quake_alert/code
SHARP_MODULE="$PWD/node_modules/sharp" node /Users/abisoye/.codex/skills/logiclabs-progressive-coding/scripts/compose-cards.mjs src/lessons/earth-quake-alert/coding-stages.json src/assets/earth_quake_alert/code
npm run typecheck
npm run build:playground
```

The classroom build copies cached cards to `docs/assets/earthquake-alert-code/`; it does not call MakeCode.

Official references:

- https://makecode.microbit.org/blocks-embed
- https://github.com/microsoft/pxt-microbit/blob/master/libs/core/input.cpp (gesture dropdowns and 3g/6g/8g enums)
- https://makecode.microbit.org/reference/music/play-melody
