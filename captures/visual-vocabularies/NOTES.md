# One orange. Eleven ways of seeing.

27 October 2026. Initial visual vocabulary study requested by Gabriel.

Six directions: drypoint, pochoir, wiped monotype, cut paper, scratched oil pastel, and the invented Carbon & citrus hybrid. All generated with the built-in image_gen tool. No separate paid API backend was used. Each delivered image is 1254 × 1254 pixels. JPEG copies are stored here; original generation files remain in the generator's output directory.

## What matters

Prompt the mechanics of a mark, not just a style label. Fix the palette, the behaviour of edges, the use of empty space, and what must be omitted. Inspect the actual output: numeric shape limits and requests for incompleteness were not reliably followed. These are digital interpretations, not authentic demonstrations of physical printmaking.

After round one, Carbon & citrus was the recommended direction to develop, and monotype the strongest mood study. After round three, stencil + red pencil is the first coordinated-series candidate from the tested set. Cross-subject consistency was untested at the end of round one; round three below records the first limited check. The first five share a scene, not a locked character; the sixth changes the sitter and crop deliberately.

## The Eraser

The first cut-paper image added a lamp, plant, vase, sun, landscape, rug and table legs. An image edit removed them and reduced the window to a detached blue shape. Both versions are kept for comparison. The revision, rather than the busier original, appears in the six-study sheet.

## Reuse

- Exact generation prompts and the cut-paper edit prompt: [prompts.json](prompts.json).
- Candidate house rule: interrupted blue carbon lines; one opaque orange accent; large areas of white; no completed silhouettes; contemporary, unidealised people.
- Follow-up experiment: round three now repeats this rule across a group, a practical task and an object-only subject, with one first pass per case. See [the companion study](series/).

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


## Round two: five more treatments

Gabriel asked to continue with the other suggested treatments: brush-and-ink, end-grain wood engraving, technical pen, photocopy and a stencil hybrid. All five are now represented by studies 07–11. The shared sitter brief changes to a contemporary middle-aged woman with short greying hair and a plain sweatshirt. This remains a scene comparison, not an identity-locked portrait series.

Wood engraving is the most commanding new image. Photocopy changes the composition most. Industrial stencil + red pencil is the most promising new hybrid. Technical pen is clear and useful for explanation, but the result is familiar instructional line art and does not achieve the strange oblique projection requested. Brushwork gives strong black masses but still over-completes the face and window.

The Eraser removed grey hair shading, cheek hatching and most facial modelling from study 11. The original remains in its before/after disclosure; the simplified revision is the primary image.

All new images are 1254 × 1254 pixels. Exact round-two generation and edit prompts are in [prompts-round-two.json](prompts-round-two.json); the combined set in [prompts.json](prompts.json) now holds eleven studies. The original six-study sheet stays at [proof.html](proof.html). The second sheet is [proof-two.html](proof-two.html), and [proof-all.html](proof-all.html) compares all eleven.

Additional material reference: [National Portrait Gallery: Wood engraving](https://www.npg.org.uk/collections/explore/glossary-of-art-terms/wood-engraving.php).

### Round-two verification

- [x] Generate and visually inspect all five new studies and the stencil revision.
- [x] Parse modified HTML and JSON after writing.
- [x] Tested eleven-study gallery at widths 1440, 768, 390 and 320: all 24 image elements loaded, no horizontal overflow, working round-two navigation, prompt disclosure and stencil before/after. Both new sheets fit tablet and phone widths. Zero console errors.
- [x] Inspected both 1200 × 630 preview images and the updated phone screenshot; both sheets fit without clipping.
- [x] Verified the live page anonymously: HTTP 200, eleven studies, all 24 image elements loaded, five new thumbnail destinations, eleven combined and five round-two prompt records, working stencil before/after, all three sheets and previews HTTP 200, one updated studio listing, zero console errors. Public visibility was preserved.

## Round three: prompt portability across subjects

The initial cross-subject test is now complete in [Can a style travel?](series/). Three fixed style blocks crossed with three fixed scene briefs produced nine independent first passes, without image references. Carbon & citrus, stencil + red pencil and white-line engraving remain recognisable across a conversation, a bicycle repair and an object-only still life. Palette is more dependable here than omission, pencil pressure or physically plausible stencil construction. The experiment is one first pass per combination, not proof of general reliability.

Two subsequent stencil still-life edits are recorded separately and are excluded from the nine first-pass comparison. The Eraser removed the chipped-paint effects; that edit also smoothed away the edge character. A second edit restored some blunt edge changes and partial red marks, while the desired fragile pencil remains unresolved. Full observations, prompts and the verification checklist are in the companion study.
