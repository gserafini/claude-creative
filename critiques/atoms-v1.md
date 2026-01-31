# Critique: atoms.js (v1)

## What Works

**"keeps the lone memory / moment and absence / bare as shadow"** -- this is the best thing in the batch. Three lines, three different textures. The first line has weight ("keeps" implies effort, "lone memory" implies cost). The second line strips down to pure noun juxtaposition -- no verb, just "and" doing all the work. The third line lands with an image that earns its abstraction. This poem has *shape*.

**"brief rain turns / where wind pulls, pause / old year cracks"** -- "old year cracks" is a genuinely good line. It sounds like something. The double meaning of "cracks" (breaking apart, or the sound of breaking) gives it density. And "pause" sitting alone as a noun after a comma is rhythmically interesting -- the line itself pauses.

**The architecture is right.** Categorized atoms with semantic groupings (nature, sky, water, void, time) crossed with verb moods (stillness, motion, change, force, gentle) -- this is a real generative vocabulary, not a bag of words. The collision between *domains* creates meaning. Water meeting void is different from sky meeting time. That's structural, not accidental.

**The hybrid templates create actual syntax.** "not X but Y" and "where X, Y" and "half X, half Y" -- these aren't just slots, they're *argumentative structures*. They imply relationships. "not shore but light" makes a claim. It has rhetorical force.

## What Doesn't Work

**"rough as space"** -- dead on arrival. "Rough" is a texture word. "Space" is an abstraction. The simile asks me to feel something ("rough") through something I can't touch ("space"). It's not surreal, it's just grammatically unfortunate. The `as` template is the weakest one because similes demand that tenor and vehicle share *some* sensory channel, and random atoms won't reliably do that.

**"no root swallows"** -- is the root doing the swallowing, or is someone swallowing no roots? The ambiguity isn't productive here. It just stalls. Compare to "no light reaches" which works because "reaches" is intransitive enough. The `no X verbs` template needs verbs that don't demand objects, or it produces confusion instead of compression.

**"settles the old tide / stream touches space / rough as space"** -- "space" appears twice in three lines. In a curated poem that would be a deliberate echo. Here it's obviously the random number generator showing its seams. The original collision.js had the *same problem* ("always changing / always changing"). You haven't solved repetition, you've just made it less likely per batch. That's not a fix, it's a prayer.

**The quality words are too safe.** "Rough, smooth, sharp, soft, cold, warm, bright, dark." These are the first ten adjectives you'd brainstorm. They're *accurate* but they're not *interesting*. Where's "threadbare"? "Brackish"? "Residual"? The nouns have personality (I like "hush," I like "epoch"). The adjectives are wearing khakis.

**Template 5 calls `n2(n)` but relies on a global `_lastDomain` variable.** That's a side-effect waiting to misfire.

## The Actual Problem

The system produces *lines*. It does not produce *poems*.

Look at the best output again: "keeps the lone memory / moment and absence / bare as shadow." Why does it work? Because the three lines *happen* to escalate -- from action to stillness to image. That's luck. The system has no concept of trajectory. It doesn't know that a poem should go somewhere.

The templates handle syntax within a line. Nothing handles syntax *between* lines. Line 1 and line 3 have no relationship except that they share a domain collision. That's a floor, not a ceiling.

## The Next Provocation

You built atoms. Good. Now build *gravity*.

What I mean: a poem isn't three random lines from the same word-pool. It's three lines where each one *changes the pressure*. Line 2 should know what line 1 did and push against it or deepen it. Line 3 should resolve or break what the first two built.

Concretely: **line-level mood sequencing**. If line 1 draws from `stillness` verbs, line 2 should pull from `motion` or `force` -- not randomly, but because contrast creates energy. If line 1 uses a `void` noun, line 2 could either stay in void (accumulation) or jump to `nature` (collision) -- but the *choice* should be a compositional decision, not a coin flip.

Three acts. Tension, turn, landing. Even in three lines, even with atoms, even generatively -- the sequence should have *direction*.

Also: kill the `as` template or constrain it. Similes are too demanding for uncurated atoms.
