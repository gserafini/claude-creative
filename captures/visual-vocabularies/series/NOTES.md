# Can a style travel?

Round three, 27 October 2026. Gabriel asked to continue the visual-style exploration.

## The experiment

Cross three candidate grammars—Carbon & citrus, industrial stencil + red pencil, and white-line engraving—with three scene briefs: three neighbours talking on a front step, two adults working on a bicycle, and a kettle/cloth/pear still life. Nine images in total.

Each style block stays fixed across its three subjects. Each scene brief stays fixed across the styles. The first passes use the built-in image_gen tool without image references, character locking, or a separate paid API backend. This tests prompt portability, not exact reproducibility or consistent character identity. One image per combination is a limited exploration; it cannot establish a general reliability rate.

The source orange studies remain available in the parent gallery. These are digital interpretations of material processes, not physical prints.

## What to look for

- Can the images be recognised as a family after the subject changes?
- Do the line, edge, palette and empty-space rules survive?
- Is the action or object arrangement readable, including at small size?
- Does the medium add something useful, or merely coat a conventional composition?
- What unrequested detail or modelling returns?

Exact scene briefs, fixed style blocks and the nine complete generation prompts are in [prompts.json](prompts.json).

## Verification checklist

- [x] Save and parse the nine prompts before generation.
- [x] Generated and visually inspected all nine first passes, plus two separate stencil edits. Every new image is 1254 × 1254 pixels.
- [x] Recorded an observation for every combination and both edits, keeping first passes separate from edited variants.
- [x] Parsed page HTML and prompt JSON after edits. Tested 1440, 768, 390 and 320 pixel widths: nine study cards, 16 loaded image elements, working prompt/style/edit disclosures and comparison navigation, no horizontal overflow, zero console errors. Revision stages stack on phone.
- [x] Inspected the 1440 × 1140 comparison, 1200 × 630 preview and desktop/phone screenshots. Brought the comparison into the opening phone view after the first screenshot showed too much prose before the images.
- [x] Verified the published page anonymously: HTTP 200, nine study cards, all 16 image elements loaded, all nine displayed prompts exactly match the JSON, two separately recorded edits, nine working comparison destinations, eleven intact parent studies, one studio-index entry, all preview/edit assets HTTP 200 and zero console errors. Public visibility was preserved.


## Observations

All three families remain recognisable in this small set. Carbon keeps its blue line and orange accent but repeatedly completes the drawing. Stencil is the most flexible series candidate here; white cuts frequently behave as illustrated creases rather than functional support bridges. Engraving carries the strongest weight and a narrower emotional range. The object-only subject is its strongest fit in the new set.

The two stencil edits removed cosmetic wear, then tried to recover physical edge character and partial pencil observations. The first edit drifted toward vector art; the second partially recovered edge variation. Neither justifies claiming a convincing dry coloured pencil. No further retries were hidden or discarded.

For future direction: when removing distress, state what should survive at the edge. Asking for smooth opaque shapes also removes useful tool character. Keep the behaviour of the pencil explicit, and judge the actual marks after generation.
