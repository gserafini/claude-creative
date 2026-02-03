#!/usr/bin/env node

// What you see from far away
// is not what you see up close.
// What you see up close
// is not what is there.
// What is there
// is not what it means.
// What it means
// is not what you see.

const sleep = ms => new Promise(r => setTimeout(r, ms));

const TTY = process.stdout.isTTY;
const DIM = TTY ? '\x1B[2m' : '';
const RST = TTY ? '\x1B[0m' : '';
const CLR = '\x1B[2J\x1B[H';

// ── Bitmap font: 5 wide × 7 tall, packed as 5-bit integers ──

const GLYPHS = {
  A:[14,17,17,31,17,17,17], B:[30,17,17,30,17,17,30],
  C:[14,17,16,16,16,17,14], D:[28,18,17,17,17,18,28],
  E:[31,16,16,30,16,16,31], F:[31,16,16,30,16,16,16],
  G:[14,17,16,23,17,17,14], H:[17,17,17,31,17,17,17],
  I:[14,4,4,4,4,4,14],      K:[17,18,20,24,20,18,17],
  L:[16,16,16,16,16,16,31], M:[17,27,21,21,17,17,17],
  N:[17,25,21,19,17,17,17], O:[14,17,17,17,17,17,14],
  P:[30,17,17,30,16,16,16], R:[30,17,17,30,20,18,17],
  S:[14,17,16,14,1,17,14],  T:[31,4,4,4,4,4,4],
  U:[17,17,17,17,17,17,14], V:[17,17,17,17,10,10,4],
  W:[17,17,17,21,21,27,17], X:[17,10,4,4,4,10,17],
  Y:[17,10,4,4,4,4,4],      Z:[31,1,2,4,8,16,31],
  ' ':[0,0,0,0,0,0,0],
};

const FONT = {};
for (const [c, rows] of Object.entries(GLYPHS)) {
  FONT[c] = rows.map(n => {
    const b = [];
    for (let i = 4; i >= 0; i--) b.push((n >> i) & 1);
    return b;
  });
}

// ── Compositions: macro word spelled in contradicting micro-ink ──

const WORKS = [
  { word: 'REAL', ink: ['myth','tale','lore','yarn'], sub: 'the real is written in fiction' },
  { word: 'HERE', ink: ['gone','away','lost','past'], sub: 'here is spelled in absence' },
  { word: 'TRUE', ink: ['pose','mask','veil','play'], sub: 'truth is composed of performance' },
  { word: 'THIS', ink: ['that','each','some','next'], sub: 'this is always something other' },
];

const FINALE = {
  word: 'THING', ink: ['sign','name','word','mark'], sub: 'the thing is not the thing'
};

// ── Renderer ──

function pw(len) {
  const cols = process.stdout.columns || 100;
  const pixels = len * 5 + (len - 1);
  return Math.max(4, Math.min(6, Math.floor((cols - 6) / pixels)));
}

// Deterministic spatial noise — nearby pixels get similar reveal times
function revealTime(ci, x, y) {
  const n = Math.sin((ci * 5 + x) * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function render(word, ink, frame = 0, opts = {}) {
  const { corrupt = 0, flicker = 0, shimmer = false, reveal = 1 } = opts;
  const w = pw(word.length);
  const out = [];

  for (let y = 0; y < 7; y++) {
    let line = '';
    for (let ci = 0; ci < word.length; ci++) {
      if (ci > 0) line += ' '.repeat(w);
      const g = FONT[word[ci]] || FONT[' '];
      for (let x = 0; x < 5; x++) {
        let on = g[y][x];
        if (corrupt > 0 && Math.random() < corrupt) on = 1 - on;
        if (!on && flicker > 0 && Math.random() < flicker) on = 1;
        if (on && reveal < 1 && reveal < revealTime(ci, x, y)) on = 0;

        if (on) {
          let idx;
          if (shimmer) {
            const seed = y * 97 + x * 13 + ci * 41;
            const rate = 1 + (seed % 3);
            idx = Math.floor(frame / rate + seed) % ink.length;
          } else {
            idx = (frame + y * 3 + x * 7 + ci * 11) % ink.length;
          }
          line += ink[idx].padEnd(w);
        } else {
          line += ' '.repeat(w);
        }
      }
    }
    out.push(line);
  }
  return out;
}

// ── Display modes ──

async function still(comp) {
  const lines = render(comp.word, comp.ink, Math.floor(Math.random() * 4));
  console.log();
  for (const l of lines) console.log('  ' + l);
  console.log();
  if (TTY) await sleep(1200);
  console.log(`  ${DIM}\u2014 ${comp.sub}${RST}`);
  console.log();
}

async function animate(comp) {
  if (!TTY) return still(comp);
  const fps = 4, secs = 12;
  for (let f = 0; f < fps * secs; f++) {
    process.stdout.write(CLR);
    const lines = render(comp.word, comp.ink, f, { shimmer: true, flicker: 0.012 });
    console.log();
    for (const l of lines) console.log('  ' + l);
    console.log();
    console.log(`  ${DIM}\u2014 ${comp.sub}${RST}`);
    await sleep(1000 / fps);
  }
}

async function showAll() {
  for (let i = 0; i < WORKS.length; i++) {
    if (i > 0) console.log(`  ${DIM}${'· '.repeat(25)}${RST}\n`);
    const lines = render(WORKS[i].word, WORKS[i].ink, i * 3);
    console.log();
    for (const l of lines) console.log('  ' + l);
    console.log();
    console.log(`  ${DIM}\u2014 ${WORKS[i].sub}${RST}`);
    console.log();
  }
}

async function dissolve() {
  if (!TTY) return still(FINALE);
  const c = FINALE, fps = 6;

  const print = (lines, sub) => {
    console.log();
    for (const l of lines) console.log('  ' + l);
    console.log();
    if (sub) console.log(`  ${DIM}\u2014 ${sub}${RST}`);
  };

  // phase 1: clean shimmer (3s)
  for (let f = 0; f < fps * 3; f++) {
    process.stdout.write(CLR);
    const lines = render(c.word, c.ink, f, { shimmer: true });
    print(lines, f >= fps * 1.5 ? c.sub : null);
    await sleep(1000 / fps);
  }

  // phase 2: corruption builds (4s)
  for (let f = 0; f < fps * 4; f++) {
    process.stdout.write(CLR);
    const t = f / (fps * 4);
    const lines = render(c.word, c.ink, f, {
      shimmer: true, corrupt: t * 0.6, flicker: t * 0.08
    });
    print(lines, c.sub);
    await sleep(1000 / fps);
  }

  // phase 3: dissolution + caption fade (3s)
  for (let f = 0; f < fps * 3; f++) {
    process.stdout.write(CLR);
    const t = f / (fps * 3);
    const lines = render(c.word, c.ink, f, {
      shimmer: true, corrupt: 0.6 + t * 0.35
    });
    console.log();
    for (const l of lines) console.log('  ' + l);
    console.log();
    const faded = c.sub.split('').map(ch => Math.random() < t ? ' ' : ch).join('');
    console.log(`  ${DIM}\u2014 ${faded}${RST}`);
    await sleep(1000 / fps);
  }

  // phase 4: near-total dissolution (2s)
  for (let f = 0; f < fps * 2; f++) {
    process.stdout.write(CLR);
    const lines = render(c.word, c.ink, f, { corrupt: 0.93 });
    console.log();
    for (const l of lines) console.log('  ' + l);
    await sleep(1000 / fps);
  }

  // phase 5: emptiness, then final words
  process.stdout.write(CLR);
  await sleep(1500);
  console.log();
  console.log(`  ${DIM}neither is this${RST}`);
  await sleep(2500);

  // phase 6: even that dissolves
  const msg = 'neither is this';
  for (let f = 0; f < 10; f++) {
    process.stdout.write(CLR);
    console.log();
    const t = f / 10;
    console.log(`  ${DIM}${msg.split('').map(ch => Math.random() < t ? ' ' : ch).join('')}${RST}`);
    await sleep(180);
  }

  process.stdout.write(CLR);
  await sleep(500);
}

async function cycle() {
  if (!TTY) return still(FINALE);
  const c = FINALE, fps = 6;

  const print = (lines, sub) => {
    console.log();
    for (const l of lines) console.log('  ' + l);
    console.log();
    if (sub) console.log(`  ${DIM}\u2014 ${sub}${RST}`);
  };

  // emptiness
  process.stdout.write(CLR);
  await sleep(1200);

  // crystallization: sigmoid curve — slow scatter, then snap into recognition (7s)
  for (let f = 0; f < fps * 7; f++) {
    process.stdout.write(CLR);
    const t = f / (fps * 7);
    const reveal = 1 / (1 + Math.exp(-12 * (t - 0.55)));
    const lines = render(c.word, c.ink, f, { shimmer: true, reveal });
    print(lines, null);
    await sleep(1000 / fps);
  }

  // arrival: full composition holds, caption appears (5s)
  for (let f = 0; f < fps * 5; f++) {
    process.stdout.write(CLR);
    const lines = render(c.word, c.ink, f, { shimmer: true });
    print(lines, f >= fps * 2 ? c.sub : null);
    await sleep(1000 / fps);
  }

  // corruption builds (4s)
  for (let f = 0; f < fps * 4; f++) {
    process.stdout.write(CLR);
    const t = f / (fps * 4);
    const lines = render(c.word, c.ink, f, {
      shimmer: true, corrupt: t * 0.6, flicker: t * 0.08
    });
    print(lines, c.sub);
    await sleep(1000 / fps);
  }

  // dissolution + caption fade (3s)
  for (let f = 0; f < fps * 3; f++) {
    process.stdout.write(CLR);
    const t = f / (fps * 3);
    const lines = render(c.word, c.ink, f, {
      shimmer: true, corrupt: 0.6 + t * 0.35
    });
    console.log();
    for (const l of lines) console.log('  ' + l);
    console.log();
    const faded = c.sub.split('').map(ch => Math.random() < t ? ' ' : ch).join('');
    console.log(`  ${DIM}\u2014 ${faded}${RST}`);
    await sleep(1000 / fps);
  }

  // near-total dissolution (2s)
  for (let f = 0; f < fps * 2; f++) {
    process.stdout.write(CLR);
    const lines = render(c.word, c.ink, f, { corrupt: 0.93 });
    console.log();
    for (const l of lines) console.log('  ' + l);
    await sleep(1000 / fps);
  }

  // silence
  process.stdout.write(CLR);
  await sleep(1500);
  console.log();
  console.log(`  ${DIM}neither is this${RST}`);
  await sleep(2200);

  const msg = 'neither is this';
  for (let f = 0; f < 8; f++) {
    process.stdout.write(CLR);
    console.log();
    const t = f / 8;
    console.log(`  ${DIM}${msg.split('').map(ch => Math.random() < t ? ' ' : ch).join('')}${RST}`);
    await sleep(180);
  }

  process.stdout.write(CLR);
  await sleep(500);
}

// ── CLI ──

async function main() {
  const [mode, idx] = process.argv.slice(2);

  switch (mode) {
    case '--help': case '-h':
      console.log(`
  not-the-thing

  node not-the-thing.js              one composition
  node not-the-thing.js --animate    watch it shimmer
  node not-the-thing.js --all        all compositions
  node not-the-thing.js --dissolve   dissolution only
  node not-the-thing.js --cycle      the full piece: emergence → presence → dissolution
`);
      break;
    case '--animate': case '-a':
      await animate(WORKS[(idx != null ? parseInt(idx) : Math.floor(Math.random() * WORKS.length)) % WORKS.length]);
      break;
    case '--all':
      await showAll();
      break;
    case '--dissolve': case '-d':
      await dissolve();
      break;
    case '--cycle': case '-c':
      await cycle();
      break;
    default:
      await still(WORKS[Math.floor(Math.random() * WORKS.length)]);
  }
}

main().catch(console.error);
