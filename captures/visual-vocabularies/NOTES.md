# One orange. Six ways of seeing.

27 October 2026. Initial visual vocabulary study requested by Gabriel.

Six directions: drypoint, pochoir, wiped monotype, cut paper, scratched oil pastel, and the invented Carbon & citrus hybrid. All generated with the built-in image_gen tool. No separate paid API backend was used. Each delivered image is 1254 × 1254 pixels. JPEG copies are stored here; original generation files remain in the generator's output directory.

## What matters

Prompt the mechanics of a mark, not just a style label. Fix the palette, the behaviour of edges, the use of empty space, and what must be omitted. Inspect the actual output: numeric shape limits and requests for incompleteness were not reliably followed. These are digital interpretations, not authentic demonstrations of physical printmaking.

Carbon & citrus is the recommended direction to develop. Monotype is the strongest mood study. Cross-subject series consistency is still untested. The first five share a scene, not a locked character; the sixth changes the sitter and crop deliberately.

## The Eraser

The first cut-paper image added a lamp, plant, vase, sun, landscape, rug and table legs. An image edit removed them and reduced the window to a detached blue shape. Both versions are kept for comparison. The revision, rather than the busier original, appears in the six-study sheet.

## Reuse

- Exact generation prompts and the cut-paper edit prompt: [prompts.json](prompts.json).
- Candidate house rule: interrupted blue carbon lines; one opaque orange accent; large areas of white; no completed silhouettes; contemporary, unidealised people.
- Next meaningful experiment: repeat that rule across a group, a practical task and an object-only subject before treating it as a production style.

## Material references

- [The Met: Drypoint](https://www.metmuseum.org/ja/essays/the-printed-image-in-the-west-drypoint)
- [Smithsonian Libraries: Vibrant Visions / Pochoir](https://library.si.edu/digital-library/exhibition/vibrant-visions-pochoir-prints-cooper-hewitt-national-design-museum)
- [MoMA: Monotype](https://www.moma.org/collection/terms/monotype)

## Browser verification note

A first image-readiness check waited for every image, including the lazy-loaded first version inside a closed disclosure. That hidden image correctly had not loaded, so the check timed out without a page or console error. For comprehensive asset verification, explicitly request eager loading before waiting for all images; test the disclosure separately. Numeric-leading HTML IDs are valid, but CSS test selectors must use an attribute selector, such as article[id="06-carbon"], rather than an unescaped hash selector. The comparison page also needs its explicit SVG favicon to avoid a browser request for a nonexistent favicon.ico.

## Verification checklist

- [x] Generate and visually inspect every study and the cut-paper revision.
- [x] Parse prompt JSON and HTML after writing.
- [x] Tested gallery at widths 1440, 768, 390 and 320 pixels: six studies, 13 image elements loaded, no horizontal overflow. Prompt and before/after disclosures work. No console errors after the comparison favicon fix.
- [x] Inspected the 1200 × 630 preview, desktop and phone screenshots. The comparison sheet fits the preview without clipping.
- [x] Verified the live page in a fresh anonymous browser context: HTTP 200, all 13 image elements loaded, six prompt records, working study navigation and disclosure, preview HTTP 200, one studio-index listing and zero console errors. Existing public visibility was preserved.
