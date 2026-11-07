# Elephant coding assets

Class: `Microbit`. Extension: `bricks4kidz=github:softsmyth/lectrify-b4k#v1.4.1`.

Three progressive stages build toward the exact supplied program:

1. On logo touched, send servo 2 angle 180 (intermediate program).
2. Add pause 500 ms, then send angle 0 (intermediate program).
3. Put all three blocks inside repeat 10 (complete supplied program).

The final program contains one pause per repeat, no added return pause, no busy
variable/guard, and no LED feedback. The blue `360 servo 2 angle` block is
`bricks4kidz.servo3602(angle)`, which uses P2; it is not a Nezha S2 block.

Hardware: micro:bit V2 for logo touch, Bricks4Kidz/BrickBit servo 2 connection
(P2), and the matching positional servo. Physical servo movement has not been
verified by the image exports or browser checks. The animal GLB is separate
from the hardware program.

Sources:

- Manifest, progression, and exact reference: `src/lessons/elephant/coding-stages.json`
- https://github.com/softsmyth/lectrify-b4k/blob/v1.4.1/main.ts
- https://github.com/softsmyth/lectrify-b4k/blob/v1.4.1/README.md
- https://makecode.microbit.org/reference/input/on-logo-event

`rendered/` contains authentic MakeCode SVG/PNG exports, exact TypeScript and
provenance. `1.png` through `3.png` are teaching cards; `full-1.png` through
`full-3.png` are cumulative program references. The corresponding SVGs remain
editable. The Coding viewer uses raw exports for its close-up view.

Regenerate with the progressive-coding skill's `render-blocks.cjs` and
`compose-cards.mjs`, passing the manifest above and this output directory.
Set `PLAYWRIGHT_MODULE`, `CHROME_EXECUTABLE`, and `SHARP_MODULE` as needed.
Rendering uses the online official editor; classroom builds use cached PNGs.
