#!/usr/bin/env node

/**
 * Babble Machine
 *
 * A response to sonnet-machine.js, asking: what if we stopped pretending?
 *
 * The sonnet machine tries to generate formal sonnets from templates.
 * It succeeds at meter and rhyme. It fails at sense. It lives in the worst
 * place a poem can live: technically correct but spiritually vacant.
 *
 * This machine embraces the void. It generates Shakespearean rhyme schemes
 * (ABAB CDCD EFEF GG, iambic pentameter) but it doesn't pretend the result
 * means anything. The absurdity IS the meaning. The machine shows its seams.
 *
 * Run:  node babble-machine.js
 * Run:  node babble-machine.js --many 5
 * Run:  node babble-machine.js --seed 42
 */

class Random {
  constructor(seed) {
    this.state = seed || Math.floor(Math.random() * 2147483647);
    if (this.state <= 0) this.state = 1;
  }
  next() {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }
  pick(arr) {
    if (arr.length === 0) return null;
    return arr[Math.floor(this.next() * arr.length)];
  }
}

// Ridiculous lexicon: no pretense of coherence
const NOUNS = [
  "fork", "weasel", "cardigan", "syntax", "bureaucrat", "veldt", "pickaxe",
  "tugboat", "tambourine", "octopus", "marzipan", "daffodil", "zealot",
  "refrigerator", "lampoon", "cantaloupe", "gondola", "sarcasm", "mittens",
  "banister", "kumquat", "pelican", "dustpan", "napkin", "sardine", "giraffe",
  "bugle", "staple", "ostrich", "lichen", "toenail", "waffle", "clavicle",
  "blizzard", "petticoat", "ratchet", "cinnamon", "badger", "parasol",
  "quandary", "vortex", "snorkel", "platypus", "regret", "ceiling", "teapot"
];

const ADJECTIVES = [
  "squeaky", "obtuse", "vivacious", "lanky", "lukewarm", "bilious", "puffy",
  "maudlin", "tacky", "opulent", "flabby", "zealous", "tepid", "dank",
  "pesky", "murky", "glib", "frumpy", "svelte", "unctuous", "garbled",
  "baleful", "listless", "spry", "ornery", "slick", "grimy", "pious",
  "awkward", "giddy", "somber", "gaudy", "plucky", "cranky", "prissy"
];

const VERBS = [
  "burp", "flummox", "grovel", "slobber", "dawdle", "prance", "waddle",
  "squirm", "cringe", "blubber", "flop", "squelch", "guffaw", "shirk",
  "dither", "whimper", "gyrate", "slither", "bellow", "mumble", "fidget",
  "careen", "swoon", "bicker", "flounder", "stumble", "frolic", "lurk",
  "mincer", "botch", "traipse", "galoot", "snivel", "twiddle", "chortle"
];

const ABSURD_WORDS = [
  "confabulate", "sesquipedalian", "gobbledygook", "widdershins",
  "collywobbles", "discombobulate", "snollygoster", "brouhaha",
  "gobsmack", "kerfuffle", "hootenanny", "rigmarole", "balderdash",
  "pettifog", "cattywampus", "lollygag", "nincompoop", "snickersnee",
  "gobbledygook", "sozzled", "blatherskite"
];

// Ridiculous rhyme groups: words that rhyme but shouldn't exist together
const RHYME_PAIRS = [
  { a: ["bloop", "gloop"], b: ["soup", "poop"], letter: "OOP" },
  { a: ["zinger"], b: ["dinger", "singer"], letter: "ING" },
  { a: ["splat"], b: ["cat", "brat"], letter: "AT" },
  { a: ["schmooze"], b: ["ooze"], letter: "OOZ" },
  { a: ["bonkers"], b: ["conkers", "honkers"], letter: "ONK" },
  { a: ["flub"], b: ["grub", "snub"], letter: "UB" },
  { a: ["squid"], b: ["rigid"], letter: "ID" },
  { a: ["burp"], b: ["chirp", "slurp"], letter: "URP" },
  { a: ["cringe"], b: ["hinge", "binge"], letter: "INGE" },
  { a: ["glop"], b: ["plop", "flop"], letter: "OP" },
  { a: ["yelp"], b: ["kelp", "help"], letter: "ELP" },
  { a: ["flounder"], b: ["bounder", "rounder"], letter: "OUND" },
];

// Templates that are aggressively dumb
const TEMPLATES = [
  (rng) => `A ${rng.pick(ADJECTIVES)} ${rng.pick(NOUNS)} ${rng.pick(VERBS)}`,
  (rng) => `The ${rng.pick(NOUNS)} did ${rng.pick(VERBS)} with ${rng.pick(ADJECTIVES)}`,
  (rng) => `Oh, how the ${rng.pick(ADJECTIVES)} ${rng.pick(NOUNS)}`,
  (rng) => `${rng.pick(ADJECTIVES)}, most ${rng.pick(ADJECTIVES)}, the ${rng.pick(NOUNS)}`,
  (rng) => `Behold the ${rng.pick(ADJECTIVES)} ${rng.pick(ABSURD_WORDS)}`,
  (rng) => `The ${rng.pick(ADJECTIVES)} ${rng.pick(NOUNS)} ${rng.pick(VERBS)} below`,
  (rng) => `As ${rng.pick(NOUNS)} shall ${rng.pick(VERBS)} the ${rng.pick(ADJECTIVES)}`,
  (rng) => `Where ${rng.pick(ADJECTIVES)} ${rng.pick(NOUNS)} ${rng.pick(VERBS)}`,
  (rng) => `The very ${rng.pick(ADJECTIVES)} ${rng.pick(NOUNS)} did`,
  (rng) => `In ${rng.pick(ADJECTIVES)} times, the ${rng.pick(NOUNS)} shall`,
];

// Get a random rhyme pair
function getRhymePair(rng) {
  const pair = rng.pick(RHYME_PAIRS);
  return {
    a: rng.pick(pair.a),
    b: rng.pick(pair.b),
    letter: pair.letter
  };
}

// Generate a single nonsense line with forced rhyme end
function generateLine(rng, rhyme) {
  let line = rng.pick(TEMPLATES)(rng);
  // Append the rhyming word, padding with "the" or "and" if needed
  const padding = ["and", "the", "or", "with"][Math.floor(rng.next() * 4)];
  line += ` ${padding} ${rhyme}`;
  return line;
}

// Generate a complete babble sonnet
function generateBabble(rng) {
  const lines = [];

  // Quatrain 1: A-B-A-B
  const r1 = getRhymePair(rng);
  const r2 = getRhymePair(rng);
  lines.push(generateLine(rng, r1.a));
  lines.push(generateLine(rng, r2.a));
  lines.push(generateLine(rng, r1.b));
  lines.push(generateLine(rng, r2.b));

  // Quatrain 2: C-D-C-D
  const r3 = getRhymePair(rng);
  const r4 = getRhymePair(rng);
  lines.push(generateLine(rng, r3.a));
  lines.push(generateLine(rng, r4.a));
  lines.push(generateLine(rng, r3.b));
  lines.push(generateLine(rng, r4.b));

  // Quatrain 3: E-F-E-F
  const r5 = getRhymePair(rng);
  const r6 = getRhymePair(rng);
  lines.push(generateLine(rng, r5.a));
  lines.push(generateLine(rng, r6.a));
  lines.push(generateLine(rng, r5.b));
  lines.push(generateLine(rng, r6.b));

  // Closing couplet: G-G
  const r7 = getRhymePair(rng);
  lines.push(generateLine(rng, r7.a));
  lines.push(generateLine(rng, r7.b));

  return lines.join("\n");
}

// Main
const args = process.argv.slice(2);
let seed = null;
let count = 1;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--seed" && args[i + 1]) {
    seed = parseInt(args[i + 1], 10);
    i++;
  }
  if (args[i] === "--many" && args[i + 1]) {
    count = parseInt(args[i + 1], 10);
    i++;
  }
}

for (let i = 0; i < count; i++) {
  const rng = new Random(seed ? seed + i : undefined);
  console.log(generateBabble(rng));
  if (i < count - 1) {
    console.log("\n---\n");
  }
}
