# Elephant coding assets

The user-supplied reference is a logo-touch handler with repeat 10, a Nezha
360-degree positional servo on S2 set to 180, pause 500 ms, then angle 0.

The six teaching stages keep that event, port, angles and count. Stage 3 adds a
second 500 ms pause after angle 0 so the return is not immediately overwritten
by the next cycle. Stages 5 and 6 teach a Running Boolean, LED feedback and an
if-not-Running guard. The final handler ignores touches until it has finished.

Hardware: micro:bit V2 (logo touch), Nezha board with servo on S2, and a
360-degree **positional** servo. Verify the linkage's working range before
mounting it. A continuous-rotation servo needs different control semantics.
MakeCode's simulator can show touch events and LED feedback; servo movement
must be checked on the physical build. The lesson's animal GLB is separate
from this hardware program.

## Sources

- Manifest and complete code: `src/lessons/elephant/coding-stages.json`
- Pinned extension: `nezha=github:elecfreaks/pxt-nezha#v1.3.10`
- Block definitions: https://github.com/elecfreaks/pxt-nezha/blob/v1.3.10/main.ts
- Logo touch: https://makecode.microbit.org/reference/input/on-logo-event
- Servo timing: https://wiki.elecfreaks.com/en/microbit/planetx-series/servo-and-motor/Plant_X_EF10155/

`rendered/` contains authentic MakeCode SVG/PNG exports, exact TypeScript for
each export, and provenance. These are not redrawn block illustrations.
`1.png` through `6.png` are 16:9 teaching cards; `full-*.png` are cumulative
program references. Matching SVG compositions remain editable.

Regenerate with the `logiclabs-progressive-coding` skill's `render-blocks.cjs`
and `compose-cards.mjs`, passing the manifest above and this output folder.
Set `PLAYWRIGHT_MODULE`, `CHROME_EXECUTABLE`, and `SHARP_MODULE` to existing
installations as needed. Rendering needs the online official MakeCode editor;
ordinary classroom builds only copy cached PNGs.
