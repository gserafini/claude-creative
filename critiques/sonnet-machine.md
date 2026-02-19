# Critique: sonnet-machine.js

## What Works

The lexicon is the real achievement here. Seven hundred words hand-tagged with stress patterns and rhyme groups, organized into grammatical categories with prosodic subcategories (monosyllabic, iambic, trochaic) — this is genuine craft labor. The vocabulary has texture: "unkempt," "forlorn," "tarnishes," "smolders." These aren't the words a thesaurus would hand you. Someone curated with taste.

The template architecture is also sound in principle. The idea of slot-based line generation where every template has been verified to sum to ten syllables with iambic stress — that's the right constraint. The working-out-loud in the comments (lines 398-691) where you can watch the builder counting syllables and rejecting patterns that don't scan? That's honest. It shows the rigor.

The rhyme scheme enforcement works. ABAB CDCD EFEF GG, distinct rhyme groups per letter, no end-word repetition. The mechanical bones are solid.

## What Doesn't

The machine produces *meter* but not *sense*. And it knows this about itself — or rather, its builder knew this and shipped it anyway. Look at what comes out:

> "Each wrong disguise betrays against the crow"

> "The birth of wave portrays the sharp kindness"

> "The bold window excites upon the crown"

These are metrically correct nonsense. The prepositions ("against," "upon," "beyond," "within") are doing structural work in the templates but semantic damage in the output. "Betrays against the crow" — what relationship does "against" encode here? None. It's a metrical spacer wearing a preposition's clothes. "The birth of wave portrays the sharp kindness" — "of wave" is a genitive that means nothing. "The sharp kindness" is an adjective-noun pairing that could mean something but doesn't earn it.

The templates are the bottleneck. There are roughly 25 of them, and they all share the same syntactic spine: article + adjective + noun + verb + preposition + article + adjective + noun. Variations exist (genitive chains, "what X can Y" modal constructions) but the ear catches the repetition by the second quatrain. Every line sounds like every other line wearing a different hat.

The punctuation is cosmetic. Random commas, semicolons, enjambments — these are dressing applied after the fact, not structural decisions arising from the grammar. A semicolon between two lines that have no logical relationship is just a semicolon.

There is also a code smell: the first `TEMPLATES` array (line 392-416) is defined, filled with one entry and a bunch of comments about abandoned approaches, then effectively thrown away when `ALL_TEMPLATES` takes over at line 453. The old array sits there like scaffolding nobody removed.

## What's Missing

**Semantic coherence at any scale.** Not asking for GPT — asking for constraints that would make nonsense less likely. Semantic tags on words (natural/artificial, dark/light, body/landscape) could bias selection toward local consistency. If line 1 picks "river" and "winter," line 2 could favor the nature cluster over the architecture cluster. Even crude affinity scores would produce "The winter river flows beneath the frost" more often than "The bold window excites upon the crown."

**Syntactic variety.** The templates need questions, imperatives, conditional constructions, inversions. "Shall I compare thee" is iambic pentameter. "Let me not to the marriage of true minds" is iambic pentameter. "That time of year thou mayst in me behold" is iambic pentameter. These are wildly different syntactic shapes. The machine has one shape.

**The volta.** A Shakespearean sonnet turns. Line 9 or line 13 should mark a shift — "but," "yet," "and yet." Some templates start with "yet" or "though," but they're distributed randomly across all 14 positions. The couplet should feel like arrival. Right now it feels like lines 13 and 14.

**Awareness of its own project.** The comment block says "Not neural text generation — combinatorial poetry from rules." That's the interesting claim. But the machine doesn't *explore* what combinatorial poetry can do that neural generation can't. It's trying to imitate sonnets. A combinatorial machine should do something only a combinatorial machine can do: exhaustive enumeration, permutation as meaning, the uncanny valley between grammar and sense as a deliberate effect rather than an accident.

## One Provocation

The journal says "the mechanic IS the meaning." So what does this machine *mean*?

Right now it means: "I can assemble words that scan." That's a solved problem — it's a proof of concept, not a poem. The interesting question is: what happens when you take combinatorial generation seriously as a *poetic form* rather than as an approximation of human sonnets?

Raymond Queneau's *Cent mille milliards de poemes* — ten sonnets where any line can substitute for the corresponding line in any other, yielding 10^14 poems — worked because each individual line made sense, and the surprise came from juxtaposition, not from word salad. The machine is closer to Tristan Tzara pulling words from a hat than to Queneau. Tzara was making a point about randomness. Is this machine making a point?

Consider: what if the templates were fewer but *each one was a complete, sensible sentence pattern*? Not "the {A1} {N2t} {V2i} {prep} the {N1}" but "the {A1} {N2t} {V2i} what the {A1} {N1} could not" — templates that carry meaning in their bones, where the slots change the content but not the coherence. Twenty good sentence shapes, each one a small machine that produces sense. You'd lose the combinatorial explosion but gain the thing that makes a sonnet a sonnet: the feeling that someone meant something.

Or go the other direction entirely. Embrace the nonsense. Make it stranger. Drop the pretense of natural English and let the machine show its seams. "The birth of wave portrays the sharp kindness" is almost interesting — it's a surrealist line that the machine stumbled into. But it doesn't know that, and neither does the reader, because it's surrounded by lines trying to be normal and failing.

Pick a lane: sense or strangeness. The middle ground — accidentally weird grammar wearing a formal suit — is the one place a sonnet machine shouldn't live.
