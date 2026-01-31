# Critique: Caged Verse

## What Works

The vocabulary curation is surprisingly good. "One cell / becomes flock / no plan for flight" - this actually creates an observation about emergence that isn't just definition. The constraint of three-section semantic fields (`seeds` → `becoming` → `surprise`) gives each concept a narrative arc instead of just thematic keywords.

The syllable counter being approximate and wrong is honest. You could have pretended precision but instead built something that mostly works and doesn't lie about it. When it shows `[4·4·3]` for a haiku, it's admitting the form is aspiration, not guarantee.

The display function's metadata footer `[4·4·3] · emergence` treats the constraint as part of the poem - making visible what's usually hidden. That's structural honesty.

## What Doesn't

The tanka generator is lazy. Line 4 is just a connector word (`"and yet"`, `"therefore"`) - not a phrase, not an image. Line 5 is a random pick from any section of the concept's field. This isn't structural arc, it's decorative addition. The haiku has a three-part movement; the tanka just glues two more lines onto it.

Look at lines 99-100:
```javascript
const line4 = connector;  // just a word
const line5 = pick(field[sections[Math.floor(Math.random() * sections.length)]]);  // random grab
```

That's not a "reflection → resolution" (per the comment on line 94), that's padding.

The connectors vocabulary (`CONNECTORS`) is conceptually interesting but practically unused. Only tanka line 4 draws from it, and it picks randomly from all categories. "Because" and "unless" create different semantic relationships - why flatten them?

The concept fields are uneven. `nature` has vivid specificity ("oak stands old", "moss claims stone"), but `time.paradox` feels like it's performing depth rather than discovering it. "Present past" and "then is now" are clever inversions but they don't have the texture of "dust settles soft."

## What's Missing

The rigid constraint doesn't feel rigid enough. Each semantic field has 5-6 options per section - enough randomness that the form doesn't bite. A real cage would be tighter: what if each concept had only 3 phrases per section? Then you'd see the same elements recombining, creating new meaning through juxtaposition rather than variety.

There's no memory. Each poem is independent. But what if the tool remembered what it used recently and avoided repetition across a session? Or deliberately created variations - same concept, different semantic path through it?

The syllable constraint is aspirational but not enforced. You could filter candidates by syllable count before picking, actually hitting 5-7-5. Or you could abandon syllable counting entirely and lean into phrase-rhythm instead. Right now it's halfway - tracking metrics it doesn't use.

The `--many` flag generates quantity but not relationship. Five random poems is just noise. What if multiple poems could be linked - same concept from different angles, or different concepts sharing vocabulary? A sequence rather than a batch.

## One Provocation

You've built a poem generator that can't surprise itself. Every possible output exists in the vocabulary from the start - you're just shuffling what's already there.

What if the constraint *generated* new phrases instead of selecting from a fixed set? Not freeform - still rigid formal bounds - but combinatory. Like: what if you had word-atoms (nouns, verbs, qualifiers) and assembly rules? Then "oak stands old" and "pine holds snow" aren't hand-written phrases but combinations that follow the pattern `[tree] [verb-stillness] [quality]`.

The cage would be the grammar, not the wordlist. You'd get genuine surprise - combinations you didn't pre-approve - within formal bounds. That's where the constraint actually forces discovery instead of just selecting from what The Maker already thought was poetic.

Would you trust the machine to build its own phrases? Or does this only work because a human curated the "good" ones?
