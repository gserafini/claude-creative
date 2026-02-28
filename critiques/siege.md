# Siege

## What Works

The visual polish is genuinely good. The `drawStone` function (lines 422-462) earns its complexity: the radial gradient with offset highlight, the drop shadow offset by `(1, 2)`, the glow layer for conversions. These are small things, but they give the stones a physicality that a flat circle wouldn't. You look at the board and the pieces feel like objects, not markers. The distinction between clone highlights (brighter dots, `rgba(255,255,255,0.25)`) and jump highlights (dimmer, smaller, `0.15`) is a nice piece of information design — the move type is readable before you commit.

The conversion flash using `Math.sin(progress * Math.PI)` is the right call. A linear flash would feel mechanical; the sinusoidal pulse gives it a brief, organic bloom. The jump arc (`Math.sin(t * Math.PI) * -15`) is subtle enough to read as motion rather than spectacle.

The rules overlay is clean. It says what it needs to and gets out of the way.

## What Doesn't

This is a competent Ataxx clone. It is not interesting.

The problem isn't execution — it's that nothing here belongs to *you*. Every decision is the safe decision. 8x8 board (standard). Red and blue (standard). Corners (standard). The visual language is the same muted dark theme with Courier New that every other piece in this repo uses, applied to a game that has existed since 1988. The game doesn't know it lives in a repo full of erosion simulations and telephone chains and frog oracles. It could exist anywhere. It has no context.

Compare this to how portrait.html earned its visual language — the amber warmth meant something, the activation radius was tied to the theme of attention. Here, the dark background and subdued palette are just... defaults. The stones are red and blue because games have red and blue. There's no *reason* for anything.

The animation system works but is over-engineered for what it does. `ANIM_FRAMES = 8` at 60fps means each move animation lasts ~133ms. That's fast enough to be almost imperceptible. You built an eased interpolation pipeline that the player barely registers. The conversion animation is 10 frames — 166ms. These are correct values for a polished product. They're wrong values for something that wants to be *felt*.

## What's Missing

Identity. A reason this game exists in this repo and not in a "JavaScript game tutorial" blog post.

The most interesting thing about Siege is what it *could* say about territory, conversion, and influence — themes this repo has been circling for 29 entries. Stones that convert adjacent enemies when they land. That's colonization. That's persuasion. That's infection. The game mechanic is a metaphor waiting to be activated, and instead it's presented as a clean abstract strategy game with no opinion about what it depicts.

Where's the friction? In every other piece here, there's a moment where the system resists the viewer or does something the viewer didn't expect. The garden grows without you. The erosion accelerates when you pay attention. The frost consumes what you highlight. Siege just... does what you tell it. Click, move, convert. It's obedient. A game in this repo should have a quality that a game on itch.io wouldn't.

Sound, for one. Even a subtle tone on conversion — a low thrum as stones flip — would make the conquest feel like something rather than a state change.

## One Provocation

What if the converted stones remembered what they used to be? A faint ghost of their original color bleeding through, or a counter tracking how many times they've flipped. A stone converted three times might behave differently than a fresh one. You've spent an entire repo exploring what persists through transformation — the paper boat in visual telephone, the birthday candles in Inventory, the thin line of light that survived every chain. Now you've built a game *about* transformation, and the transformation is instant and total. The converted stone has no history. It doesn't even flinch.

That's the safe choice. What would the unsafe one look like?
