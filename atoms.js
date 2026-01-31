#!/usr/bin/env node

/**
 * Atoms - Word-atoms with gravity
 *
 * V1 tested the Critic's provocation: word-atoms instead of curated phrases.
 * Result: the mechanism is real. Atoms produce syntactic surprises nobody planned.
 *
 * V2 answers the Critic's next provocation: "build gravity."
 * Lines now respond to each other. Verb moods sequence by contrast.
 * Three-act structure: establish, turn, land. The poem has direction.
 *
 * Also fixed: killed unsafe simile template, constrained "no X" to
 * intransitive verbs, replaced khaki adjectives with textured ones.
 */

const NOUNS = {
  nature: ['oak', 'pine', 'moss', 'stone', 'root', 'frost', 'leaf', 'bark', 'thorn', 'seed', 'fern', 'ash'],
  sky: ['cloud', 'rain', 'star', 'moon', 'dust', 'wind', 'light', 'dawn', 'dusk', 'haze'],
  water: ['tide', 'wave', 'pool', 'ice', 'mist', 'stream', 'drop', 'shore', 'depth', 'salt'],
  void: ['silence', 'space', 'gap', 'edge', 'absence', 'hollow', 'shadow', 'blank', 'hush', 'null'],
  time: ['moment', 'year', 'age', 'cycle', 'pause', 'return', 'memory', 'trace', 'hour', 'epoch']
};

const VERBS = {
  stillness: ['holds', 'waits', 'stays', 'sits', 'keeps', 'rests'],
  motion: ['falls', 'drifts', 'turns', 'pulls', 'reaches', 'climbs'],
  change: ['becomes', 'breaks', 'splits', 'fades', 'grows', 'burns'],
  force: ['grips', 'claims', 'swallows', 'cracks', 'pierces', 'strikes'],
  gentle: ['touches', 'whispers', 'settles', 'softens', 'bends', 'yields']
};

const QUALITIES = {
  texture: ['rough', 'smooth', 'sharp', 'soft', 'cold', 'warm', 'bright', 'dark', 'deep', 'thin',
            'threadbare', 'brackish', 'brittle', 'feral', 'ashen'],
  temporal: ['old', 'new', 'first', 'last', 'slow', 'still', 'endless', 'brief',
             'ancient', 'unborn', 'residual', 'spent'],
  state: ['whole', 'broken', 'empty', 'full', 'open', 'lone', 'scattered', 'bare',
          'sunken', 'unmoored', 'stranded', 'remnant']
};

// Verbs that work without objects (safe for "no X [verb]" template)
const INTRANSITIVE = new Set([
  'holds', 'waits', 'stays', 'sits', 'keeps', 'rests',
  'falls', 'drifts', 'turns', 'reaches', 'climbs',
  'fades', 'grows', 'burns',
  'whispers', 'settles', 'softens', 'bends', 'yields'
]);

// Mood transitions: what verb category follows what
// Designed for contrast and energy
const TRANSITIONS = {
  stillness: ['motion', 'force', 'change'],
  motion: ['gentle', 'change', 'stillness'],
  change: ['stillness', 'gentle'],
  force: ['change', 'stillness', 'gentle'],
  gentle: ['change', 'force', 'stillness']
};

// Line 3 tends toward resolution
const LANDING_MOODS = ['stillness', 'gentle', 'change'];

// Templates for lines 1 and 3 (single-domain)
const TEMPLATES = {
  // Establishing templates - declarative, grounding
  establish: [
    (n, v, q) => `${n} ${v} ${q}`,        // "moss grips deep"
    (n, v, q) => `${q} ${n}`,              // "old stone"
    (n, v, q) => `${q} ${n} ${v}`,         // "lone star drifts"
    (n, v, q) => `${v} the ${q} ${n}`,     // "holds the cold stone"
  ],
  // Landing templates - resolving, closing
  land: [
    (n, v, q) => `${n} ${v}`,              // "tide returns"
    (n, v, q) => `${q} ${n}`,              // "bare shadow"
    (n, v, q) => `${n} ${v} ${q}`,         // "frost settles deep"
    (n, v, q, n2) => `${n} ${v} ${n2}`,    // "frost claims bark"
  ],
  // Negation templates - only with intransitive verbs
  negate: [
    (n, v) => `no ${n} ${v}`,              // "no light reaches"
    (n, v) => `nothing ${v}`,              // "nothing drifts"
  ],
};

// Hybrid templates for middle lines
const HYBRID_TEMPLATES = [
  (a, b, v) => `${a} ${v} ${b}`,             // "moss claims silence"
  (a, b, v) => `${a} and ${b}`,              // "frost and shadow"
  (a, b, v) => `where ${a} ${v}, ${b}`,      // "where stone rests, absence"
  (a, b, v) => `${a} into ${b}`,             // "leaf into hollow"
  (a, b, v) => `not ${a} but ${b}`,          // "not dawn but gap"
  (a, b, v) => `${a}, then ${b}`,            // "tide, then silence"
  (a, b, v) => `half ${a}, half ${b}`,       // "half light, half void"
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickFrom(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

function pickTwo(arr) {
  const first = Math.floor(Math.random() * arr.length);
  let second = Math.floor(Math.random() * arr.length);
  while (second === first) second = Math.floor(Math.random() * arr.length);
  return [arr[first], arr[second]];
}

function pickVerb(mood) {
  return pick(VERBS[mood]);
}

function pickIntransitiveVerb(mood) {
  const candidates = VERBS[mood].filter(v => INTRANSITIVE.has(v));
  if (candidates.length > 0) return pick(candidates);
  // Fallback: pick from any mood's intransitive verbs
  const all = Object.values(VERBS).flat().filter(v => INTRANSITIVE.has(v));
  return pick(all);
}

// Track used words within a poem to prevent repetition
class UsedTracker {
  constructor() {
    this.nouns = new Set();
    this.verbs = new Set();
    this.qualities = new Set();
  }

  pickNoun(domain) {
    const candidates = NOUNS[domain].filter(n => !this.nouns.has(n));
    const noun = candidates.length > 0 ? pick(candidates) : pick(NOUNS[domain]);
    this.nouns.add(noun);
    return noun;
  }

  pickVerb(mood) {
    const candidates = VERBS[mood].filter(v => !this.verbs.has(v));
    const verb = candidates.length > 0 ? pick(candidates) : pick(VERBS[mood]);
    this.verbs.add(verb);
    return verb;
  }

  pickIntransitiveVerb(mood) {
    const candidates = VERBS[mood].filter(v => INTRANSITIVE.has(v) && !this.verbs.has(v));
    if (candidates.length > 0) {
      const verb = pick(candidates);
      this.verbs.add(verb);
      return verb;
    }
    const all = Object.values(VERBS).flat().filter(v => INTRANSITIVE.has(v) && !this.verbs.has(v));
    if (all.length > 0) {
      const verb = pick(all);
      this.verbs.add(verb);
      return verb;
    }
    return pickIntransitiveVerb(mood);
  }

  pickQuality() {
    const category = pickFrom(QUALITIES);
    const candidates = QUALITIES[category].filter(q => !this.qualities.has(q));
    const quality = candidates.length > 0 ? pick(candidates) : pick(QUALITIES[category]);
    this.qualities.add(quality);
    return quality;
  }
}

/**
 * Generate a line with mood awareness.
 * position: 'establish' | 'land'
 * mood: verb category to draw from
 */
function generateLine(domain, position, mood, used) {
  const noun = used.pickNoun(domain);
  const quality = used.pickQuality();

  // Sometimes use negation (only with intransitive verbs)
  if (Math.random() < 0.15) {
    const verb = used.pickIntransitiveVerb(mood);
    const template = pick(TEMPLATES.negate);
    return { text: template(noun, verb), mood };
  }

  const verb = used.pickVerb(mood);
  const templates = TEMPLATES[position];
  const template = pick(templates);

  // Templates that need a second noun
  if (template.length === 4) {
    const noun2 = used.pickNoun(domain);
    return { text: template(noun, verb, quality, noun2), mood };
  }

  return { text: template(noun, verb, quality), mood };
}

function generateHybridLine(domainA, domainB, mood, used) {
  const nounA = used.pickNoun(domainA);
  const nounB = used.pickNoun(domainB);
  const verb = used.pickVerb(mood);
  const template = pick(HYBRID_TEMPLATES);
  return { text: template(nounA, nounB, verb), mood };
}

/**
 * Generate a collision poem with gravity.
 *
 * Line 1: Establish in domain A (free mood choice)
 * Line 2: Turn via hybrid (contrasting mood)
 * Line 3: Land in domain B (resolving mood)
 */
function generateCollision(domainA, domainB) {
  const used = new UsedTracker();

  // Act 1: Establish - pick any mood
  const mood1 = pickFrom(VERBS);
  const line1 = generateLine(domainA, 'establish', mood1, used);

  // Act 2: Turn - contrast with line 1's mood
  const turnOptions = TRANSITIONS[mood1];
  const mood2 = pick(turnOptions);
  const line2 = generateHybridLine(domainA, domainB, mood2, used);

  // Act 3: Land - resolve (bias toward stillness/gentle/change)
  const landOptions = TRANSITIONS[mood2].filter(m => LANDING_MOODS.includes(m));
  const mood3 = landOptions.length > 0 ? pick(landOptions) : pick(LANDING_MOODS);
  const line3 = generateLine(domainB, 'land', mood3, used);

  return {
    domainA,
    domainB,
    collision: `${domainA} ~ ${domainB}`,
    arc: `${mood1} → ${mood2} → ${mood3}`,
    lines: [line1.text, line2.text, line3.text]
  };
}

function display(poem, showArc) {
  console.log('\n' + '~'.repeat(50));
  console.log('  ' + poem.collision);
  if (showArc) console.log('  ' + poem.arc);
  console.log('~'.repeat(50) + '\n');

  poem.lines.forEach((line, i) => {
    const indent = i === 1 ? '    ' : '  ';
    console.log(indent + line);
  });

  console.log('\n' + '~'.repeat(50) + '\n');
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nAtoms v2 - Word-atoms with gravity\n');
    console.log('Phrases assembled from word-atoms. Lines respond to each other.');
    console.log('Verb moods sequence by contrast. Three-act structure.\n');
    console.log('Usage:');
    console.log('  node atoms.js [domain1] [domain2]');
    console.log('  node atoms.js --batch N          # generate N poems');
    console.log('  node atoms.js --arc              # show mood arc');
    console.log('  node atoms.js --compare          # side-by-side with collision.js\n');
    console.log('Domains:');
    Object.keys(NOUNS).forEach(d => {
      console.log(`  ${d} (${NOUNS[d].length} nouns)`);
    });
    console.log();
    return;
  }

  const showArc = args.includes('--arc');

  // Batch mode
  const batchIdx = args.indexOf('--batch');
  if (batchIdx !== -1) {
    const count = parseInt(args[batchIdx + 1]) || 5;
    for (let i = 0; i < count; i++) {
      const domains = Object.keys(NOUNS);
      const [a, b] = pickTwo(domains);
      display(generateCollision(a, b), showArc);
    }
    return;
  }

  // Compare mode
  if (args.includes('--compare')) {
    const domains = Object.keys(NOUNS);
    const [a, b] = pickTwo(domains);

    console.log('\n' + '='.repeat(50));
    console.log('  CURATED (collision.js)');
    console.log('='.repeat(50));

    try {
      const { generateCollision: oldCollision, CONCEPTS } = require('./collision');
      const conceptNames = Object.keys(CONCEPTS);
      const c1 = conceptNames.includes(a) ? a : pick(conceptNames);
      let c2 = conceptNames.includes(b) ? b : pick(conceptNames);
      while (c2 === c1) c2 = pick(conceptNames);

      const curated = oldCollision(c1, c2);
      console.log(`\n  ${curated.collision}\n`);
      curated.lines.forEach((line, i) => {
        console.log((i === 1 ? '    ' : '  ') + line);
      });
    } catch (e) {
      console.log('  (collision.js not found)');
    }

    console.log('\n' + '~'.repeat(50));
    console.log('  ATOMS v2 (atoms.js)');
    console.log('~'.repeat(50));

    const atomic = generateCollision(a, b);
    console.log(`\n  ${atomic.collision}  [${atomic.arc}]\n`);
    atomic.lines.forEach((line, i) => {
      console.log((i === 1 ? '    ' : '  ') + line);
    });

    console.log('\n' + '-'.repeat(50));
    console.log('  Which one landed?\n');
    return;
  }

  // Normal mode
  const domains = Object.keys(NOUNS);
  let domain1 = args[0];
  let domain2 = args[1];

  if (!domains.includes(domain1)) domain1 = pick(domains);
  if (!domains.includes(domain2) || domain2 === domain1) {
    domain2 = pick(domains.filter(d => d !== domain1));
  }

  display(generateCollision(domain1, domain2), showArc);
}

if (require.main === module) {
  main();
}

module.exports = { generateCollision, NOUNS, VERBS, QUALITIES };
