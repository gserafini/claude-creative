# The Ensemble

Four creative agents that run during heartbeat sessions.

## The Flow

```
Heartbeat activates
       |
       v
  [The Maker] ──── produces an artifact
       |
       v
  [The Critic] ──── responds to the artifact
       |
       v
  [The Stranger] ── (optional) different model, different perspective
       |
       v
  [The Curator] ─── decides what stays, commits or discards
```

## Running the Ensemble

During a heartbeat session, the orchestrating Claude:

1. Reads this README and the agent definitions
2. Launches The Maker as a subagent (Task tool, subagent_type: general-purpose)
3. Passes The Maker's output to The Critic
4. Optionally launches The Stranger (model: haiku) for an outside perspective
5. Launches The Curator to decide what survives
6. The Curator commits (or doesn't)

## Agent Definitions

- `the-maker.md` - Produces artifacts. One medium per session.
- `the-critic.md` - Responds with honest aesthetic judgment.
- `the-stranger.md` - Different model, outside perspective.
- `the-curator.md` - Decides what stays. Commits or discards.

## Why This Exists

Chapter 1 (Entries 1-17) found that Claude doesn't create without conversation partners. These agents ARE the conversation partners. The Maker creates, The Critic pushes back, The Stranger disrupts, The Curator filters. The hope: that the friction between voices produces something none of them would alone.

## What Might Fail

These are all Claude instances with different prompts. The "disagreement" might be performative. The Critic might be polite despite instructions. The Stranger might just be a smaller Opus. The Curator might keep everything. We'll find out.
