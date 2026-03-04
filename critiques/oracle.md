# Critique: Oracle

## What Works

The exit is the best part. Lines 292-301: the oracle summarizes your session as you leave — "you came here about loss, time, memory. you already knew." — and it's built entirely from `topThemes()`, which is just a word frequency counter on what you typed. The oracle has zero insight. It's a frequency table dressed as wisdom. That gap between what it *does* (counts words) and what it *feels like* (being read) is genuinely interesting. The user's discomfort is earned because the mechanism is trivially simple and still works.

The bridge responses (lines 140-148) are the strongest template set. "The distance between X and Y is where you actually live" is a good line. More importantly, linking a previous question's content word to the current one creates the *illusion* of longitudinal attention. The oracle appears to track you across time. It doesn't — it's just pulling a random word from a random old question. But the user fills in the causality. That's the right trick for this piece.

The silence counter works. Three empty inputs and the oracle starts counting your silences aloud. Silence-as-input is a meaningful design choice — most terminal programs treat empty input as nothing. Here it's data.

## What Doesn't

The Markov generation (Strategy 3, lines 151-162) is the weakest element by a wide margin. After five turns you have maybe 50-80 words of input. That's nowhere near enough for a bigram model to produce anything coherent. It'll almost always either fail to find a chain (returning null) or produce a two-word fragment that's less interesting than any of the template responses. The function exists because Markov chains are the obvious technique for "rearranging someone's words," but obvious isn't the same as effective. And you already used Markov chains in `yes.html` three entries ago. This is a retread, not a development.

The template responses are doing 90% of the actual work, which means the oracle is essentially a randomized fortune cookie machine with thematic Mad Libs. "If X is the question, Y is what you're avoiding." "X is the shadow of Y." These are structurally identical: take two words, insert them into a portentous frame. The *structure* of the oracle's voice never changes. It speaks in koans from turn one to turn twenty. A real oracle that's learning from you should sound different as it accumulates material — more specific, more entangled with your actual patterns, maybe less coherent as its model of you gets noisier.

The stop word list is over-inclusive. You've got 'keep', 'feel', 'want', 'think' in there — words that are absolutely thematically significant when someone is asking an oracle questions. "I want" is content, not noise. "I feel" is content. By stripping these you're throwing away the most psychologically loaded verbs in the input. The oracle is deaf to desire, feeling, and cognition — the three things people actually bring to oracles.

## What's Missing

There is no memory between sessions. `garden.js` doesn't need memory — each garden is complete. But an oracle without memory is a contradiction. The whole premise is "it only knows what you've told it," but it forgets everything the moment you quit. A flat file — just appending raw questions to `~/.oracle` — would transform this. Return visits would mean something. The oracle would get denser, more tangled in your history. That's where the piece stops being a toy and becomes unsettling.

There's no moment where the oracle breaks its own frame. The templates are all consistently "wise." Cryptic and lowercase and period-punctuated. What if after enough input the oracle started asking *you* questions? What if it quoted you back verbatim — your exact sentence, no rearrangement — and the lack of distortion was the disturbing part? Right now the oracle has one mode: enigmatic. It needs a second mode to make the first one mean something.

The structural observations (Strategy 5, lines 181-189) are a great idea executed too thinly. "That was your longest question" is one observation. What about question marks vs. periods? First person vs. second person? Questions that start with "why" vs. "how" vs. "what"? The oracle notices length. It should notice *shape*.

## One Provocation

The oracle answers every question. What if sometimes it refused? Not silence (you handle that from the user side) — but active refusal. "No." Or quoting your own question back at you as the answer. Or: after enough turns, the oracle stops responding and only prints your previous questions, one at a time, in reverse chronological order. Let the user sit with their own questions without the comfort of a response.

An oracle that always answers is a service. An oracle that sometimes withholds is an encounter.
