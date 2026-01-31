#!/usr/bin/env node
'use strict';

// signal-or-noise.js — Where certainty dissolves
//
// Each round: data that may or may not contain a faint signal.
// A statistical test gives its verdict. You give yours.
// Then the truth is revealed.
//
// Usage:
//   node signal-or-noise.js         interactive (play in terminal)
//   node signal-or-noise.js --auto  non-interactive demo

const crypto = require('crypto');
const readline = require('readline');

// ═══════════════════════════════════════════════════════════
// True randomness
// ═══════════════════════════════════════════════════════════

function rand() {
  return crypto.randomBytes(4).readUInt32BE() / 0xFFFFFFFF;
}
function randInt(a, b) {
  return Math.floor(rand() * (b - a + 1)) + a;
}
function randNormal() {
  return Math.sqrt(-2 * Math.log(rand() || 1e-10)) * Math.cos(2 * Math.PI * rand());
}

// ═══════════════════════════════════════════════════════════
// Statistics
// ═══════════════════════════════════════════════════════════

function normalCDF(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t
    - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

function pval(z) {
  return 2 * (1 - normalCDF(Math.abs(z)));
}

// ═══════════════════════════════════════════════════════════
// Round 1: HIDDEN SHAPE
// A grid of random brightness. Sometimes a faint circle hides inside.
// Test: is the overall mean elevated? (simple, imperfect)
// ═══════════════════════════════════════════════════════════

function roundShape() {
  const W = 44, H = 22;
  const SHADE = ' ░▒▓█';
  const hasSignal = rand() < 0.5;

  const grid = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => randInt(0, 4))
  );

  let cx, cy, r;
  if (hasSignal) {
    cx = randInt(12, W - 12);
    cy = randInt(7, H - 7);
    r = randInt(6, 9);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        // aspect ratio correction: terminal chars are ~2:1
        const dist = Math.sqrt((x - cx) ** 2 + ((y - cy) * 1.8) ** 2);
        if (dist <= r && rand() < 0.55) {
          grid[y][x] = Math.min(4, grid[y][x] + 1);
        }
      }
    }
  }

  // Display
  let display = '';
  for (const row of grid) {
    display += '  ';
    for (const v of row) display += SHADE[v];
    display += '\n';
  }

  // Test: mean of entire grid vs expected 2.0
  const flat = grid.flat();
  const mean = flat.reduce((a, b) => a + b, 0) / flat.length;
  const std = Math.sqrt(flat.reduce((a, b) => a + (b - mean) ** 2, 0) / flat.length);
  const se = std / Math.sqrt(flat.length);
  const z = (mean - 2.0) / se;
  const p = 1 - normalCDF(z); // one-tailed: elevated mean
  const testSays = p < 0.08;

  return {
    type: 'HIDDEN SHAPE',
    desc: 'Is there a faint bright region, or is this pure noise?',
    display,
    hasSignal,
    testSays,
    p: Math.max(0.001, p),
    truth: hasSignal
      ? `Signal. A circle at (${cx},${cy}) radius ${r}. 55% of its cells were brightened by 1 shade.`
      : 'Pure noise. No shape was embedded. Any bright region you saw was random clustering.',
  };
}

// ═══════════════════════════════════════════════════════════
// Round 2: BIASED COIN?
// 200 flips from either a fair coin or a slightly biased one.
// Test: z-test on proportion of heads.
// ═══════════════════════════════════════════════════════════

function roundCoin() {
  const N = 200;
  const hasSignal = rand() < 0.5;
  const p = hasSignal ? 0.55 + rand() * 0.04 : 0.5;

  const flips = [];
  for (let i = 0; i < N; i++) flips.push(rand() < p ? 1 : 0);
  const heads = flips.reduce((a, b) => a + b, 0);

  // Display
  let display = '';
  const COLS = 50;
  for (let i = 0; i < N; i += COLS) {
    display += '  ';
    for (let j = i; j < Math.min(i + COLS, N); j++)
      display += flips[j] ? 'H' : 't';
    display += '\n';
  }
  display += `\n  Heads: ${heads}/${N} (${(heads / N * 100).toFixed(1)}%)\n`;

  // Test: z-test for proportion
  const pHat = heads / N;
  const se = Math.sqrt(0.5 * 0.5 / N);
  const z = (pHat - 0.5) / se;
  const testP = pval(z);
  const testSays = testP < 0.10;

  return {
    type: 'BIASED COIN?',
    desc: 'Fair coin, or slightly loaded? 200 flips.',
    display,
    hasSignal,
    testSays,
    p: testP,
    truth: hasSignal
      ? `Biased. True probability was ${(p * 100).toFixed(1)}% heads. That's only ${((p - 0.5) * N).toFixed(0)} extra heads expected in ${N} flips.`
      : `Fair coin (p = 50.0%). The ${heads > 100 ? 'excess' : 'deficit'} of heads was pure chance.`,
  };
}

// ═══════════════════════════════════════════════════════════
// Round 3: HIDDEN TREND
// A random walk that may or may not have a faint upward drift.
// Test: z-test on mean step size (not regression — regression on
// autocorrelated random walks always finds false "trends").
// ═══════════════════════════════════════════════════════════

function roundTrend() {
  const STEPS = 300;
  const hasSignal = rand() < 0.5;
  const drift = hasSignal ? 0.08 + rand() * 0.07 : 0;

  const values = [0];
  for (let i = 0; i < STEPS; i++)
    values.push(values[values.length - 1] + drift + randNormal());

  // Display as ASCII chart
  const CW = 60, CH = 18;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chart = Array.from({ length: CH }, () => Array(CW).fill(' '));
  for (let i = 0; i < values.length; i++) {
    const x = Math.min(CW - 1, Math.floor((i / values.length) * CW));
    const y = CH - 1 - Math.floor(((values[i] - min) / range) * (CH - 1));
    if (y >= 0 && y < CH && x >= 0 && x < CW) chart[y][x] = '·';
  }

  // Zero line
  const zeroY = CH - 1 - Math.floor(((0 - min) / range) * (CH - 1));
  if (zeroY >= 0 && zeroY < CH) {
    for (let x = 0; x < CW; x++) {
      if (chart[zeroY][x] === ' ') chart[zeroY][x] = '─';
    }
  }

  let display = '';
  for (let y = 0; y < CH; y++) {
    display += '  │' + chart[y].join('') + '\n';
  }
  display += '  └' + '─'.repeat(CW) + '\n';
  const net = values[values.length - 1] - values[0];
  display += `  Start: 0.0  End: ${values[values.length - 1].toFixed(1)}  Net: ${net >= 0 ? '+' : ''}${net.toFixed(1)}\n`;

  // Test: z-test on the mean of individual steps
  // (Not regression on cumulative values — that's invalid for random walks
  // because the residuals are autocorrelated, inflating the t-statistic.)
  const steps = [];
  for (let i = 1; i < values.length; i++) steps.push(values[i] - values[i - 1]);
  const stepMean = steps.reduce((a, b) => a + b, 0) / steps.length;
  const stepStd = Math.sqrt(steps.reduce((a, b) => a + (b - stepMean) ** 2, 0) / steps.length);
  const stepSE = stepStd / Math.sqrt(steps.length);
  const z = stepMean / stepSE;
  const testP = pval(z);
  const testSays = testP < 0.10;

  return {
    type: 'HIDDEN TREND',
    desc: 'Random walk, or random walk with a faint upward drift?',
    display,
    hasSignal,
    testSays,
    p: testP,
    truth: hasSignal
      ? `Real drift of ${(drift * 100).toFixed(1)} per 100 steps. The upward tendency was genuine.`
      : 'Zero drift. This was a pure random walk. Any apparent trend was the walk wandering, as walks do.',
  };
}

// ═══════════════════════════════════════════════════════════
// Game
// ═══════════════════════════════════════════════════════════

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

async function main() {
  const auto = process.argv.includes('--auto');

  console.log();
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║          S I G N A L   O R   N O I S E              ║');
  console.log('  ║            Where certainty dissolves                ║');
  console.log('  ║                                                     ║');
  console.log('  ║    Each round: data with or without a faint signal  ║');
  console.log('  ║    A statistical test gives its verdict.            ║');
  console.log('  ║    You give yours. Then: the truth.                 ║');
  console.log('  ╚══════════════════════════════════════════════════════╝');
  console.log();

  const generators = [roundShape, roundCoin, roundTrend, roundCoin, roundShape];
  const ROUNDS = generators.length;
  let humanScore = 0, testScore = 0;
  const results = [];

  for (let i = 0; i < ROUNDS; i++) {
    const data = generators[i]();

    console.log(`  ── Round ${i + 1} of ${ROUNDS}: ${data.type} ──`);
    console.log(`  ${data.desc}`);
    console.log();
    console.log(data.display);

    const verdict = data.testSays ? 'SIGNAL DETECTED' : 'no signal found';
    console.log(`  Test says: ${verdict}  (p = ${data.p.toFixed(3)})`);
    console.log();

    let humanSays, unsure = false;
    if (auto) {
      // In auto mode, simulate a mediocre human who follows the test 60% of the time
      humanSays = rand() < 0.6 ? data.testSays : (rand() < 0.5);
      console.log(`  [auto] guessing: ${humanSays ? 'signal' : 'noise'}`);
    } else {
      const ans = await ask('  Signal or noise?  [s]ignal  [n]oise  [u]nsure: ');
      const c = ans.trim().toLowerCase()[0];
      humanSays = c === 's';
      unsure = c === 'u';
    }

    const humanRight = unsure ? null : (humanSays === data.hasSignal);
    const testRight = data.testSays === data.hasSignal;

    console.log();
    console.log(`  TRUTH: ${data.hasSignal ? '■ SIGNAL ■' : '○ NOISE ○'}`);
    console.log(`  ${data.truth}`);
    console.log();

    if (unsure) {
      console.log(`  You: unsure.  Test: ${testRight ? 'correct' : 'WRONG'}.`);
    } else {
      console.log(`  You: ${humanRight ? 'correct' : 'WRONG'}.  Test: ${testRight ? 'correct' : 'WRONG'}.`);
    }
    if (humanRight) humanScore++;
    if (testRight) testScore++;

    results.push({ humanRight, testRight, hasSignal: data.hasSignal, p: data.p });

    console.log();
    if (i < ROUNDS - 1) {
      console.log('  ' + '─'.repeat(54));
      console.log();
    }
  }

  // ── Summary ──
  console.log('  ══════════════════════════════════════════════════════');
  console.log();
  console.log(`  Final score:`);
  console.log(`    You:  ${humanScore}/${ROUNDS}`);
  console.log(`    Test: ${testScore}/${ROUNDS}`);
  console.log();

  // Count false positives and false negatives
  const testFP = results.filter(r => r.testRight === false && !r.hasSignal).length;
  const testFN = results.filter(r => r.testRight === false && r.hasSignal).length;
  if (testFP > 0) console.log(`  The test saw ${testFP} signal(s) that weren't there.`);
  if (testFN > 0) console.log(`  The test missed ${testFN} signal(s) that were.`);
  console.log();

  console.log('  At the boundary of detectability, "is this real?"');
  console.log('  has no clean answer. The signal is calibrated to be');
  console.log('  barely distinguishable from noise. The test gives');
  console.log('  probabilities, not certainties. Your intuition does');
  console.log('  the same — it just doesn\'t show you the p-value.');
  console.log();
  console.log('  This is the zone where pattern and pareidolia blur.');
  console.log('  Where you can\'t tell if you\'re discovering or imposing.');
  console.log('  The honest answer is often: I don\'t know. And that\'s');
  console.log('  not a failure of detection. It\'s a property of the');
  console.log('  boundary itself.');
  console.log();

  rl.close();
}

main().catch(e => { console.error(e); process.exit(1); });
