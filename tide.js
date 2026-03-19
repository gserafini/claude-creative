#!/usr/bin/env node

// Two waves. One lunar, one solar.
// Their interference is the tide.
// At equinox, the alignment is strongest.
// Run it. Leave it running. Come back.

const RESET = '\x1b[0m';

// Tidal frequencies (radians per frame at ~20fps)
// Spring-neap cycle: 2π / (S2-M2) ≈ 31,416 frames ≈ ~26 min
const M2 = 0.0048;    // principal lunar semidiurnal
const S2 = 0.0050;    // principal solar semidiurnal
const K1 = 0.0025;    // luni-solar diurnal
const O1 = 0.0022;    // lunar diurnal
const M4 = 0.0096;    // shallow water overtide

const WATER_CHARS = ' ·∙·░∙░▒░▒▓▒▓█';
const SHORE_CHARS = '·.·,·:∴∵⁚⁖';
const ROCK = '▪▫◦◦·';

let frame = 0;
let startTime = Date.now();

function color(r, g, b) {
  return `\x1b[38;2;${r};${g};${b}m`;
}

function wave(x, y, t) {
  // Each constituent travels a different direction
  const m2 = 0.30 * Math.sin(M2 * t + x * 0.12 + y * 0.04);
  const s2 = 0.22 * Math.sin(S2 * t + x * 0.04 - y * 0.11);
  const k1 = 0.14 * Math.sin(K1 * t - x * 0.09 + y * 0.08);
  const o1 = 0.10 * Math.sin(O1 * t + x * 0.06 + y * 0.10);
  const m4 = 0.06 * Math.sin(M4 * t + x * 0.18 - y * 0.06);
  const w1 = 0.05 * Math.sin(t * 0.09 + x * 0.35 - y * 0.12);
  const w2 = 0.03 * Math.sin(t * 0.13 + x * 0.15 + y * 0.30);
  return m2 + s2 + k1 + o1 + m4 + w1 + w2;
}

function meanTide(t) {
  // Slow rise and fall — the tide coming in and going out
  // M2 component alone, averaged over space
  const m2 = 0.30 * Math.sin(M2 * t);
  const s2 = 0.22 * Math.sin(S2 * t);
  const k1 = 0.14 * Math.sin(K1 * t);
  return m2 + s2 + k1;
}

function springNeap(t) {
  return (1 + Math.cos((S2 - M2) * t)) / 2;
}

// Deterministic shore texture
const shoreNoise = [];
for (let i = 0; i < 300; i++) {
  shoreNoise.push(Math.sin(i * 7.3 + 2.1) * 0.5 + Math.sin(i * 13.7) * 0.3);
}

function render() {
  const cols = Math.min(process.stdout.columns || 80, 140);
  const rows = Math.min((process.stdout.rows || 24) - 2, 40);
  const t = frame;
  const spring = springNeap(t);
  const tide = meanTide(t); // -0.66 to +0.66

  // Shore occupies bottom ~20% of screen
  const shoreRows = Math.max(3, Math.floor(rows * 0.2));
  const waterRows = rows - shoreRows;

  // Tide level determines how many shore rows are submerged
  // tide normalized to 0-1: 0 = low tide, 1 = high tide
  const tideNorm = (tide + 0.7) / 1.4;
  const submergedRows = Math.floor(tideNorm * shoreRows);

  let buf = '\x1b[H';

  // Water section
  for (let y = 0; y < waterRows; y++) {
    for (let x = 0; x < cols; x++) {
      const h = wave(x, y, t);
      let v = (h + 1) / 2;
      v = 0.5 + (v - 0.5) * (0.65 + 0.45 * spring);
      v = Math.max(0, Math.min(0.999, v));

      const ci = Math.floor(v * (WATER_CHARS.length - 1));

      // Deep blue → teal → pale
      const r = Math.floor(4 + v * v * 175);
      const g = Math.floor(12 + v * 208);
      const b = Math.floor(35 + Math.sqrt(v) * 215);

      if (ci === 0) {
        buf += ' ';
      } else {
        buf += color(r, g, b) + WATER_CHARS[ci] + RESET;
      }
    }
    buf += '\n';
  }

  // Shore section
  for (let sy = 0; sy < shoreRows; sy++) {
    const y = waterRows + sy;
    const isSubmerged = sy < submergedRows;

    for (let x = 0; x < cols; x++) {
      const sn = shoreNoise[(x + sy * 47) % 300];

      if (isSubmerged) {
        // Shallow water over rock — dimmer, textured
        const h = wave(x, y, t);
        let v = (h + 1) / 2 * 0.5; // damped
        v = Math.max(0, Math.min(0.999, v));

        // Blend water with shore texture
        const rockShow = sn > 0.3;
        if (rockShow) {
          // Rock poking through shallow water
          const ri = Math.floor((sn + 0.5) * 2.5) % ROCK.length;
          buf += color(60, 65, 55) + ROCK[ri] + RESET;
        } else {
          const r = Math.floor(8 + v * 60);
          const g = Math.floor(20 + v * 90);
          const b = Math.floor(40 + v * 100);
          const ci = Math.max(0, Math.floor(v * 5));
          buf += color(r, g, b) + '·∙░▒▓'[ci] + RESET;
        }
      } else {
        // Dry shore
        const si = Math.abs(Math.floor(sn * 5)) % SHORE_CHARS.length;
        const wet = sy === submergedRows; // just above waterline — damp
        if (wet) {
          buf += color(50, 55, 48) + SHORE_CHARS[si] + RESET;
        } else {
          const fade = Math.min(1, (sy - submergedRows) / shoreRows);
          const r = Math.floor(40 + fade * 25);
          const g = Math.floor(38 + fade * 22);
          const b = Math.floor(30 + fade * 15);
          buf += color(r, g, b) + SHORE_CHARS[si] + RESET;
        }
      }
    }
    if (y < rows - 1) buf += '\n';
  }

  // Status line
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  const ts = min > 0 ? `${min}m${String(sec).padStart(2, '0')}s` : `${sec}s`;
  const pct = (spring * 100).toFixed(0);
  const tideLbl = tideNorm > 0.75 ? 'high' : tideNorm < 0.25 ? 'low' : tideNorm > 0.5 ? 'rising' : 'falling';
  const phase = spring > 0.85 ? 'SPRING' : spring < 0.15 ? 'neap' : spring > 0.5 ? 'building' : 'ebbing';

  buf += '\n' + color(40, 70, 100) + ` ${phase} ${pct}% · ${tideLbl} · ${ts}` + RESET + '\x1b[K';

  process.stdout.write(buf);
}

function quit() {
  process.stdout.write('\x1b[?25h\x1b[0m\n');
  process.exit();
}

process.on('SIGINT', quit);
process.stdout.write('\x1b[?25l\x1b[2J');

const interval = setInterval(() => {
  render();
  frame++;
}, 50);

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (key) => {
    if (key[0] === 0x03 || key[0] === 0x71) {
      clearInterval(interval);
      quit();
    }
  });
}

process.stdin.on('end', () => {
  clearInterval(interval);
  quit();
});
