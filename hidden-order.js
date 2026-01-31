#!/usr/bin/env node
'use strict';

// hidden-order.js — Finding truth in true randomness
//
// The randomness is real (crypto.randomBytes, not Math.random).
// The truths are real (mathematical theorems, not pattern-matching).
// The connection is mathematics.
//
// Usage:
//   node hidden-order.js           # random truth
//   node hidden-order.js bell      # the bell curve emerges
//   node hidden-order.js pi        # pi hides in noise
//   node hidden-order.js walk      # the drunkard always returns
//   node hidden-order.js runs      # the streak that must exist
//   node hidden-order.js --all     # all truths in sequence

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════
// True randomness — from the OS, not a pseudorandom formula
// ═══════════════════════════════════════════════════════════

function rand() {
  return crypto.randomBytes(4).readUInt32BE() / 0xFFFFFFFF;
}

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function coinFlip() {
  return crypto.randomBytes(1)[0] & 1;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// ═══════════════════════════════════════════════════════════
// 1. THE BELL CURVE EMERGES
//    Central Limit Theorem: average anything, get a bell.
// ═══════════════════════════════════════════════════════════

function bell() {
  const N = 8000;
  const BINS = 60;
  const HEIGHT = 14;

  console.log();
  console.log('  THE BELL CURVE EMERGES');
  console.log('  ──────────────────────');
  console.log();

  const stages = [
    { avg: 1,  label: 'Raw randomness (no averaging)' },
    { avg: 2,  label: 'Average of 2' },
    { avg: 6,  label: 'Average of 6' },
    { avg: 30, label: 'Average of 30' },
  ];

  for (const stage of stages) {
    const values = [];
    for (let i = 0; i < N; i++) {
      let sum = 0;
      for (let j = 0; j < stage.avg; j++) sum += rand();
      values.push(sum / stage.avg);
    }

    const counts = new Array(BINS).fill(0);
    for (const v of values) {
      const bin = Math.min(Math.floor(v * BINS), BINS - 1);
      counts[bin]++;
    }
    const peak = Math.max(...counts);

    console.log(`  ${stage.label}:`);
    console.log();

    for (let row = HEIGHT; row > 0; row--) {
      const thresh = (row / HEIGHT) * peak;
      let line = '  ';
      for (let col = 0; col < BINS; col++) {
        if (counts[col] >= thresh) line += '█';
        else if (counts[col] >= thresh * 0.7) line += '▒';
        else line += ' ';
      }
      console.log(line);
    }
    console.log('  ' + '─'.repeat(BINS));
    console.log();
  }

  console.log('  The truth: average anything random, get a bell curve.');
  console.log('  Not designed. Not imposed. Inherent in addition itself.');
  console.log('  This is why the bell curve appears everywhere in nature —');
  console.log('  height, measurement error, exam scores — they are all');
  console.log('  sums of many small random effects, and sums converge.');
  console.log();
}

// ═══════════════════════════════════════════════════════════
// 2. PI HIDES IN NOISE
//    Monte Carlo: drop random points, find a circle, find pi.
// ═══════════════════════════════════════════════════════════

function pi() {
  const W = 58;
  const H = 29;
  const TOTAL = 4000;

  console.log();
  console.log('  PI HIDES IN NOISE');
  console.log('  ─────────────────');
  console.log();

  const grid = Array.from({ length: H }, () => Array(W).fill(' '));
  let inside = 0;

  // Draw circle outline first
  for (let a = 0; a < Math.PI * 2; a += 0.015) {
    const cx = Math.floor((0.5 + 0.5 * Math.cos(a)) * W);
    const cy = Math.floor((0.5 + 0.5 * Math.sin(a)) * H);
    if (cy >= 0 && cy < H && cx >= 0 && cx < W) {
      grid[cy][cx] = '○';
    }
  }

  // Drop random points
  for (let i = 0; i < TOTAL; i++) {
    const x = rand();
    const y = rand();
    const dist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
    const hit = dist <= 0.5;
    if (hit) inside++;

    const gx = Math.floor(x * W);
    const gy = Math.floor(y * H);
    if (gy >= 0 && gy < H && gx >= 0 && gx < W) {
      if (grid[gy][gx] === ' ' || grid[gy][gx] === '○') {
        grid[gy][gx] = hit ? '·' : '×';
      }
    }
  }

  // Render
  console.log('  ┌' + '─'.repeat(W) + '┐');
  for (const row of grid) {
    console.log('  │' + row.join('') + '│');
  }
  console.log('  └' + '─'.repeat(W) + '┘');

  const est = 4 * inside / TOTAL;
  const err = Math.abs(est - Math.PI);

  console.log();
  console.log(`  ${TOTAL} random points. ${inside} landed inside the circle.`);
  console.log(`  π ≈ 4 × ${inside}/${TOTAL} = ${est.toFixed(6)}`);
  console.log(`  Actual π = ${Math.PI.toFixed(6)}`);
  console.log(`  Error: ${err.toFixed(6)} (${(err / Math.PI * 100).toFixed(2)}%)`);
  console.log();
  console.log('  The truth: π is geometry, and geometry lives in randomness.');
  console.log('  Drop random points in a square. The fraction inside the');
  console.log('  inscribed circle, times four, converges on π. No formula.');
  console.log('  Just noise and counting. The circle was always there.');
  console.log();
}

// ═══════════════════════════════════════════════════════════
// 3. THE DRUNKARD ALWAYS RETURNS
//    Pólya's Recurrence Theorem: in 1D and 2D, random walks
//    return to the origin with probability 1.
// ═══════════════════════════════════════════════════════════

function walk() {
  const STEPS = 2000;
  const WALKS = 500;

  console.log();
  console.log('  THE DRUNKARD ALWAYS RETURNS');
  console.log('  ───────────────────────────');
  console.log();

  // --- Single walk trace ---
  const W = 60;
  const H = 30;
  const grid = Array.from({ length: H }, () => Array(W).fill(' '));
  const originX = Math.floor(W / 2);
  const originY = Math.floor(H / 2);

  let x = 0, y = 0;
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  const path = [{ x: 0, y: 0 }];
  let firstReturn = -1;

  for (let i = 0; i < STEPS; i++) {
    const dir = randInt(0, 3);
    if (dir === 0) x++;
    else if (dir === 1) x--;
    else if (dir === 2) y++;
    else y--;
    path.push({ x, y });
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    if (x === 0 && y === 0 && firstReturn === -1) firstReturn = i + 1;
  }

  // Scale path to grid
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  for (const p of path) {
    const gx = Math.floor(((p.x - minX) / rangeX) * (W - 1));
    const gy = Math.floor(((p.y - minY) / rangeY) * (H - 1));
    if (grid[gy][gx] === ' ') grid[gy][gx] = '·';
  }

  // Mark origin
  const ox = Math.floor(((0 - minX) / rangeX) * (W - 1));
  const oy = Math.floor(((0 - minY) / rangeY) * (H - 1));
  if (oy >= 0 && oy < H && ox >= 0 && ox < W) grid[oy][ox] = '★';

  // Mark final position
  const fx = Math.floor(((path[path.length - 1].x - minX) / rangeX) * (W - 1));
  const fy = Math.floor(((path[path.length - 1].y - minY) / rangeY) * (H - 1));
  if (fy >= 0 && fy < H && fx >= 0 && fx < W) grid[fy][fx] = '◆';

  console.log(`  One walk, ${STEPS} steps:`);
  console.log();
  console.log('  ┌' + '─'.repeat(W) + '┐');
  for (const row of grid) {
    console.log('  │' + row.join('') + '│');
  }
  console.log('  └' + '─'.repeat(W) + '┘');
  console.log(`  ★ = origin  ◆ = final position`);
  if (firstReturn > 0) {
    console.log(`  Returned to origin after ${firstReturn} steps.`);
  } else {
    console.log(`  Did not return to origin in ${STEPS} steps.`);
  }
  console.log();

  // --- Many walks: return statistics ---
  console.log(`  ${WALKS} walks of ${STEPS} steps each:`);
  console.log();

  let returned = 0;
  const returnSteps = [];

  for (let w = 0; w < WALKS; w++) {
    let wx = 0, wy = 0;
    let didReturn = false;
    for (let i = 0; i < STEPS; i++) {
      const dir = randInt(0, 3);
      if (dir === 0) wx++;
      else if (dir === 1) wx--;
      else if (dir === 2) wy++;
      else wy--;
      if (wx === 0 && wy === 0) {
        didReturn = true;
        returnSteps.push(i + 1);
        break;
      }
    }
    if (didReturn) returned++;
  }

  const pct = (returned / WALKS * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(returned / WALKS * 50));
  const empty = '░'.repeat(50 - bar.length);

  console.log(`  Returned:  ${bar}${empty}  ${pct}%`);
  console.log(`  (${returned}/${WALKS} walkers found their way home)`);

  if (returnSteps.length > 0) {
    const med = returnSteps.sort((a, b) => a - b)[Math.floor(returnSteps.length / 2)];
    console.log(`  Median return: ${med} steps`);
  }

  console.log();
  console.log('  The truth: in two dimensions, a random walker returns');
  console.log('  to the origin with probability 1. Always. Eventually.');
  console.log('  (In three dimensions, there is a 34% chance of never');
  console.log('  returning. The drunk finds home on a plane but gets');
  console.log('  lost in space. — Shizuo Kakutani)');
  console.log();
}

// ═══════════════════════════════════════════════════════════
// 4. THE STREAK THAT MUST EXIST
//    In N coin flips, the longest consecutive run is
//    approximately log₂(N). Longer than intuition expects.
// ═══════════════════════════════════════════════════════════

function runs() {
  const FLIPS = 200;
  const TRIALS = 1000;

  console.log();
  console.log('  THE STREAK THAT MUST EXIST');
  console.log('  ──────────────────────────');
  console.log();

  // Generate one sequence
  const seq = [];
  for (let i = 0; i < FLIPS; i++) seq.push(coinFlip());

  // Find all runs
  let maxRun = 0, maxStart = 0, maxVal = 0;
  let curRun = 1;
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] === seq[i - 1]) {
      curRun++;
    } else {
      if (curRun > maxRun) {
        maxRun = curRun;
        maxStart = i - curRun;
        maxVal = seq[i - 1];
      }
      curRun = 1;
    }
  }
  if (curRun > maxRun) {
    maxRun = curRun;
    maxStart = seq.length - curRun;
    maxVal = seq[seq.length - 1];
  }

  // Display the sequence
  console.log(`  ${FLIPS} fair coin flips (crypto random):`);
  console.log();

  const COLS = 50;
  for (let row = 0; row < FLIPS; row += COLS) {
    let line = '  ';
    let markers = '  ';
    for (let i = row; i < Math.min(row + COLS, FLIPS); i++) {
      const inStreak = i >= maxStart && i < maxStart + maxRun;
      if (inStreak) {
        line += seq[i] ? 'H' : 'T';
        markers += '▔';
      } else {
        line += seq[i] ? 'h' : 't';
        markers += ' ';
      }
    }
    console.log(line);
    if (markers.trim()) console.log(markers);
  }

  console.log();
  console.log(`  Longest streak: ${maxRun} ${maxVal ? 'heads' : 'tails'} in a row`);
  console.log(`  Expected (log₂ ${FLIPS}): ~${Math.log2(FLIPS).toFixed(1)}`);
  console.log();

  // Monte Carlo: distribution of longest runs
  console.log(`  Distribution of longest runs across ${TRIALS} trials:`);
  console.log();

  const runDist = {};
  for (let t = 0; t < TRIALS; t++) {
    let best = 1, cur = 1;
    let prev = coinFlip();
    for (let i = 1; i < FLIPS; i++) {
      const c = coinFlip();
      if (c === prev) { cur++; if (cur > best) best = cur; }
      else cur = 1;
      prev = c;
    }
    runDist[best] = (runDist[best] || 0) + 1;
  }

  const keys = Object.keys(runDist).map(Number).sort((a, b) => a - b);
  const maxCount = Math.max(...Object.values(runDist));

  for (const k of keys) {
    const count = runDist[k];
    const barLen = Math.round((count / maxCount) * 35);
    const bar = '█'.repeat(barLen);
    console.log(`  ${String(k).padStart(3)} │ ${bar} ${count}`);
  }

  console.log();
  console.log('  The truth: in 200 flips, expect a streak of ~7-8.');
  console.log('  People underestimate this. Asked to fake 200 flips,');
  console.log('  they avoid long streaks — making the fake detectable.');
  console.log('  Real randomness is streakier than humans believe.');
  console.log('  The long run isn\'t a glitch. It\'s a guarantee.');
  console.log();
}

// ═══════════════════════════════════════════════════════════
// Animation support
// ═══════════════════════════════════════════════════════════

const sleep = ms => new Promise(r => setTimeout(r, ms));
const HIDE = '\x1B[?25l';
const SHOW = '\x1B[?25h';
const HOME = '\x1B[H';
const CLR = '\x1B[2J';

function cleanup() { process.stdout.write(SHOW); }

// ── Animated Bell ──

async function bellAnimate() {
  const BINS = 60, HEIGHT = 18, SAMPLES = 3000, BATCH = 80;
  process.stdout.write(HIDE + CLR);
  process.on('SIGINT', () => { cleanup(); process.exit(); });

  const stages = [
    { avg: 1,  label: 'Raw randomness' },
    { avg: 2,  label: 'Average of 2' },
    { avg: 6,  label: 'Average of 6' },
    { avg: 30, label: 'Average of 30' },
  ];

  for (const stage of stages) {
    const counts = new Array(BINS).fill(0);
    for (let i = 0; i < SAMPLES; i += BATCH) {
      const n = Math.min(BATCH, SAMPLES - i);
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < stage.avg; k++) sum += rand();
        counts[Math.min(Math.floor((sum / stage.avg) * BINS), BINS - 1)]++;
      }
      const peak = Math.max(...counts);
      let f = HOME + '\n  THE BELL CURVE EMERGES\n  ──────────────────────\n\n';
      f += `  ${stage.label} — ${i + n} samples\n\n`;
      for (let row = HEIGHT; row > 0; row--) {
        const t = (row / HEIGHT) * peak;
        f += '  ';
        for (let c = 0; c < BINS; c++)
          f += counts[c] >= t ? '█' : counts[c] >= t * 0.7 ? '▒' : ' ';
        f += '\n';
      }
      f += '  ' + '─'.repeat(BINS) + '\n';
      process.stdout.write(f);
      await sleep(35);
    }
    await sleep(1200);
  }
  process.stdout.write('\n  Average anything. Get a bell curve. Always.\n\n');
  cleanup();
}

// ── Animated Pi ──

async function piAnimate() {
  const W = 58, H = 29, TOTAL = 4000, BATCH = 15;
  process.stdout.write(HIDE + CLR);
  process.on('SIGINT', () => { cleanup(); process.exit(); });

  const grid = Array.from({ length: H }, () => Array(W).fill(' '));
  for (let a = 0; a < Math.PI * 2; a += 0.015) {
    const cx = Math.floor((0.5 + 0.5 * Math.cos(a)) * W);
    const cy = Math.floor((0.5 + 0.5 * Math.sin(a)) * H);
    if (cy >= 0 && cy < H && cx >= 0 && cx < W) grid[cy][cx] = '○';
  }

  let inside = 0, total = 0;
  for (let i = 0; i < TOTAL; i += BATCH) {
    const n = Math.min(BATCH, TOTAL - i);
    for (let j = 0; j < n; j++) {
      const x = rand(), y = rand();
      const hit = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) <= 0.5;
      if (hit) inside++;
      total++;
      const gx = Math.floor(x * W), gy = Math.floor(y * H);
      if (gy >= 0 && gy < H && gx >= 0 && gx < W)
        if (grid[gy][gx] === ' ' || grid[gy][gx] === '○')
          grid[gy][gx] = hit ? '·' : '×';
    }
    const est = 4 * inside / total;
    const err = Math.abs(est - Math.PI);
    let f = HOME + '\n  PI HIDES IN NOISE\n  ─────────────────\n\n';
    f += '  ┌' + '─'.repeat(W) + '┐\n';
    for (const row of grid) f += '  │' + row.join('') + '│\n';
    f += '  └' + '─'.repeat(W) + '┘\n\n';
    f += `  ${total} points — π ≈ ${est.toFixed(6)}`;
    f += `  (actual: ${Math.PI.toFixed(6)})  err: ${(err / Math.PI * 100).toFixed(2)}%\n`;
    process.stdout.write(f);
    await sleep(25);
  }
  process.stdout.write('\n  The circle was always there. π was always there.\n\n');
  cleanup();
}

// ── Animated Walk ──

async function walkAnimate() {
  const STEPS = 800, W = 60, H = 30, BATCH = 3;
  process.stdout.write(HIDE + CLR);
  process.on('SIGINT', () => { cleanup(); process.exit(); });

  // Pre-generate the full walk (need bounds for rendering)
  const path = [{ x: 0, y: 0 }];
  let x = 0, y = 0, firstReturn = -1;
  for (let i = 0; i < STEPS; i++) {
    const d = randInt(0, 3);
    if (d === 0) x++; else if (d === 1) x--; else if (d === 2) y++; else y--;
    path.push({ x, y });
    if (x === 0 && y === 0 && firstReturn === -1) firstReturn = i + 1;
  }

  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  for (const p of path) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const rX = maxX - minX || 1, rY = maxY - minY || 1;
  const grid = Array.from({ length: H }, () => Array(W).fill(' '));
  const ox = Math.floor(((0 - minX) / rX) * (W - 1));
  const oy = Math.floor(((0 - minY) / rY) * (H - 1));
  if (oy >= 0 && oy < H && ox >= 0 && ox < W) grid[oy][ox] = '★';

  for (let i = 0; i < path.length; i += BATCH) {
    for (let j = 0; j < BATCH && i + j < path.length; j++) {
      const p = path[i + j];
      const gx = Math.floor(((p.x - minX) / rX) * (W - 1));
      const gy = Math.floor(((p.y - minY) / rY) * (H - 1));
      if (grid[gy][gx] === ' ') grid[gy][gx] = '·';
    }
    const cur = path[Math.min(i + BATCH - 1, path.length - 1)];
    const cx = Math.floor(((cur.x - minX) / rX) * (W - 1));
    const cy = Math.floor(((cur.y - minY) / rY) * (H - 1));
    const saved = grid[cy][cx]; grid[cy][cx] = '◆';

    let f = HOME + '\n  THE DRUNKARD ALWAYS RETURNS\n  ───────────────────────────\n\n';
    f += `  Step ${Math.min(i + BATCH, path.length)} of ${STEPS}\n\n`;
    f += '  ┌' + '─'.repeat(W) + '┐\n';
    for (const row of grid) f += '  │' + row.join('') + '│\n';
    f += '  └' + '─'.repeat(W) + '┘\n';
    f += '  ★ = origin  ◆ = walker\n';
    process.stdout.write(f);
    grid[cy][cx] = saved === '★' ? '★' : '·';
    await sleep(12);
  }

  if (oy >= 0 && oy < H && ox >= 0 && ox < W) grid[oy][ox] = '★';
  const last = path[path.length - 1];
  grid[Math.floor(((last.y - minY) / rY) * (H - 1))][Math.floor(((last.x - minX) / rX) * (W - 1))] = '◆';

  let f = '\n';
  if (firstReturn > 0) f += `  Returned home after ${firstReturn} steps.\n`;
  else f += `  Still wandering after ${STEPS} steps. (But would return. Always.)\n`;
  f += '\n  The drunk finds home on a plane but gets lost in space.\n\n';
  process.stdout.write(f);
  cleanup();
}

// ═══════════════════════════════════════════════════════════
// Orchestration
// ═══════════════════════════════════════════════════════════

const staticModes = { bell, pi, walk, runs };
const animModes = { bell: bellAnimate, pi: piAnimate, walk: walkAnimate };
const allNames = Object.keys(staticModes);
const animNames = Object.keys(animModes);

function header() {
  console.log();
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║              H I D D E N   O R D E R                ║');
  console.log('  ║         Truth hiding in true randomness             ║');
  console.log('  ║                                                     ║');
  console.log('  ║    Randomness: crypto.randomBytes (OS entropy)      ║');
  console.log('  ║    Truths: mathematical theorems, not pareidolia    ║');
  console.log('  ╚══════════════════════════════════════════════════════╝');
}

const args = process.argv.slice(2);
const animate = args.includes('--animate');
const mode = args.find(a => !a.startsWith('-'));

if (args.includes('--help') || args.includes('-h')) {
  console.log();
  console.log('  hidden-order.js — Truth hiding in true randomness');
  console.log();
  console.log('  Usage:');
  console.log('    node hidden-order.js                random truth (static)');
  console.log('    node hidden-order.js bell            the bell curve emerges');
  console.log('    node hidden-order.js pi              pi hides in noise');
  console.log('    node hidden-order.js walk            the drunkard always returns');
  console.log('    node hidden-order.js runs            the streak that must exist');
  console.log('    node hidden-order.js --all           all truths in sequence');
  console.log('    node hidden-order.js --animate       random animated truth');
  console.log('    node hidden-order.js bell --animate  animated bell curve');
  console.log();
} else if (animate) {
  const fn = mode && animModes[mode]
    ? animModes[mode]
    : animModes[pick(animNames)];
  fn().catch(e => { cleanup(); console.error(e); });
} else if (mode === '--all') {
  header();
  for (const name of allNames) {
    staticModes[name]();
    console.log('  ' + '═'.repeat(58));
  }
} else if (mode && staticModes[mode]) {
  header();
  staticModes[mode]();
} else {
  header();
  staticModes[pick(allNames)]();
}
