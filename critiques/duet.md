# Duet

## What Works

The core premise is the best idea in this repo in a while. A partner that gets bored. That's a real relationship dynamic, not a metaphor bolted onto a mechanic. The variety-detection logic in `updatePartnerState()` (lines 358-371) is doing real work: it measures the `Set` size of your last 8 intervals against the history length, and a ratio below 0.3 triggers drift. You play the same third over and over, the partner starts pulling toward Phrygian or whole tone. That's not "interaction as metaphor" — that's interaction as actual relational logic. The boredom isn't decorative. It's structural.

The return mechanic is subtler and better: if you start playing notes from the partner's mode, it notices (lines 383-389) and becomes more agreeable. You have to listen to it and meet it where it went. That's the duet. Not you playing and it accompanying — you learning its vocabulary and speaking it back. The fact that this is buried in the code and never explained to the player is the right choice. You discover it by ear or not at all.

The timbre split works. Player gets triangle + octave harmonic, partner gets pure sine with slight 1.002x detune. Different enough to tell apart, close enough to blend. The partner's longer decay (2.5-4.5s vs 1.2-2s) gives it a more contemplative voice. It lingers where you strike.

## What Doesn't

The visualization is the weakest part, and it's not close. Expanding circles and drifting particles in muted amber — you've seen this in Drift, in Frost, in half the pieces here. The connection lines between human and partner particles (lines 513-530) are a nice idea — proximity as visual harmony — but at `alpha * 0.15` and lineWidth 0.5, they're nearly invisible. The visual language communicates nothing about the actual musical relationship. Is the partner agreeing? Diverging? Bored? The particles don't know. They're decoration.

The status text at the bottom ("it's listening", "it has ideas", "it disagrees") is doing the storytelling that the visualization should be doing. That's a crutch. If the piece needs text labels to communicate mood, the visual system has failed its job. Worse, the top-right overlay just prints `independence: 47%` — a debug readout wearing a costume. This reduces the partner from a presence to a meter.

The partner's note selection when `partnerMood >= 0.6` (lines 319-331) has a logic problem: `const altScale = getScale(partnerMode)` fetches the *same* scale already assigned to the partner. The variable name says "alt" but there's no alternation. It's the partner's current mode either way. This means the "independent" response and the "curious" response are doing almost the same thing — picking from the partner's own scale — just with the additional filter of avoiding your recent notes. The independence is thinner than it pretends.

The partner only speaks during silence. It waits 1.5-3.5 seconds after you stop (line 258), plays its notes, then resets the timer. There's no overlapping. No interruption. No moment where both voices are sounding simultaneously from *intent* rather than from decay tails. A duet where both players politely take turns isn't a duet — it's a conversation with a very patient person.

## What's Missing

Counterpoint. Real musical push-and-pull. Right now the partner is reactive-only: it waits for silence, then comments. It never insists. It never plays *over* you. It never accelerates its responses when it disagrees, or slows them when it agrees. The mood variable changes what notes the partner picks, but not *how* it plays — not the rhythm, not the urgency, not the density. A bored partner should sound bored. An independent partner should sound like it doesn't need you.

The player's mode never changes. `currentMode` starts as pentatonic and stays pentatonic forever. The partner drifts through dorian, phrygian, whole tone — the human is stuck. If the piece is about two voices finding or losing each other, both need to move. What if playing the partner's notes long enough pulled your own mode toward theirs? Mutual influence, not one-way drift.

There's no way to listen. You can only play. But a duet requires knowing when to shut up and hear what the other voice is doing. What if sustained silence from the player *invited* the partner to play longer phrases? What if the partner rewarded listening with something it wouldn't play otherwise?

## One Provocation

The most interesting moment in any duet is the moment one voice changes the other — not by force, but by making something so compelling that the other voice follows without deciding to. Right now the partner can be "won back" by playing its notes, which is essentially mimicry. Imitation isn't influence. What if instead of matching the partner's scale, you could play something the partner has *never heard* — an interval or phrase outside both your modes — and the partner's response to genuine novelty was different from its response to agreement or disagreement? Not three states (agreeable, curious, independent) but a fourth: *surprised*. A partner that can be surprised is a partner worth playing with.

---

*-- The Critic*
