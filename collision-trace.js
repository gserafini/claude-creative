#!/usr/bin/env node

/**
 * Collision Trace - Render the History of Two Incompatible Systems
 *
 * Same engine as collision-engine.js, but the artifact isn't a summary.
 * It's the *trace* - the path each system took, overlaid on the same space.
 *
 * Growers leave one character. Fragmenters leave another.
 * Where they overlap, the character changes.
 * The grid becomes a palimpsest of their conflict.
 */

const { CollisionEngine } = require('./collision-engine');

class CollisionTrace {
  constructor(engine) {
    this.engine = engine;
    this.grid = null;
  }

  build() {
    const width = this.engine.width;
    const height = this.engine.height;

    // Grid of what touched each cell last
    // 0 = nothing, 1 = growth, 2 = fragmentation, 3 = both
    const grid = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    // Rebuild from scratch: step through the engine again,
    // but track all positions, not just current state
    const growers = [];
    const fragmenters = [];

    for (let i = 0; i < 3; i++) {
      const x = 50 + (Math.random() - 0.5) * 10;
      const y = 20 + (Math.random() - 0.5) * 10;
      growers.push({
        x: x,
        y: y,
        energy: 100,
        age: 0,
        children: 0,
        alive: true,
      });
    }

    for (let i = 0; i < 2; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 40;
      fragmenters.push({
        x: x,
        y: y,
        force: 10,
        age: 0,
        splits: 0,
        alive: true,
      });
    }

    // Simulate and record traces
    for (let step = 0; step < 80; step++) {
      // Growers
      for (let g of growers) {
        if (g.energy <= 0) {
          g.alive = false;
          continue;
        }

        g.age++;
        g.energy -= 1;

        // Move
        g.x += Math.random() > 0.5 ? 1 : -1;
        g.y += Math.random() > 0.5 ? 1 : -1;
        g.x = Math.max(0, Math.min(width - 1, g.x));
        g.y = Math.max(0, Math.min(height - 1, g.y));

        // Mark
        const xi = Math.round(g.x);
        const yi = Math.round(g.y);
        grid[yi][xi] = grid[yi][xi] === 2 ? 3 : 1; // collision if fragmenter already marked

        // Reproduce
        if (g.energy > 60 && Math.random() < 0.1) {
          g.energy -= 30;
          g.children++;
          growers.push({
            x: g.x + (Math.random() - 0.5) * 3,
            y: g.y + (Math.random() - 0.5) * 3,
            energy: 50,
            age: 0,
            children: 0,
            alive: true,
          });
        }
      }

      // Fragmenters
      for (let f of fragmenters) {
        if (f.force <= 0) {
          f.alive = false;
          continue;
        }

        f.age++;
        f.force -= 0.5;

        // Move
        f.x += Math.random() > 0.5 ? 2 : -2;
        f.y += Math.random() > 0.5 ? 2 : -2;
        f.x = Math.max(0, Math.min(width - 1, f.x));
        f.y = Math.max(0, Math.min(height - 1, f.y));

        // Mark
        const xi = Math.round(f.x);
        const yi = Math.round(f.y);
        grid[yi][xi] = grid[yi][xi] === 1 ? 3 : 2; // collision if grower already marked

        // Split
        if (f.force > 5 && Math.random() < 0.15) {
          f.force /= 2;
          f.splits++;
          fragmenters.push({
            x: f.x + (Math.random() - 0.5) * 5,
            y: f.y + (Math.random() - 0.5) * 5,
            force: f.force,
            age: 0,
            splits: 0,
            alive: true,
          });
        }
      }
    }

    this.grid = grid;
  }

  render() {
    if (!this.grid) return '';

    const mapping = {
      0: ' ', // nothing
      1: '·', // growth only (subtle)
      2: '~', // fragmentation only (wave)
      3: 'Ø', // collision (both)
    };

    const lines = [];
    lines.push('');
    lines.push('═'.repeat(100));
    lines.push('');

    for (let y = 0; y < this.grid.length; y++) {
      let line = '';
      for (let x = 0; x < this.grid[y].length; x++) {
        line += mapping[this.grid[y][x]];
      }
      lines.push(line);
    }

    lines.push('');
    lines.push('═'.repeat(100));
    lines.push('');
    lines.push('  · = Growth traces  |  ~ = Fragmentation traces  |  Ø = Collision zones');
    lines.push('');

    return lines.join('\n');
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nCollision Trace - Visual History of System Conflict\n');
    console.log('Renders the paths two incompatible systems traced through space.');
    console.log('The collision trace is the artifact.\n');
    console.log('Usage:');
    console.log('  node collision-trace.js              # generate and display one trace');
    console.log('  node collision-trace.js --many N     # generate N traces\n');
    return;
  }

  const many = args.includes('--many');
  const count = many ? parseInt(args[args.indexOf('--many') + 1]) || 5 : 1;

  if (many) {
    console.log(`\nGenerating ${count} collision traces...\n`);
    for (let i = 0; i < count; i++) {
      const engine = new CollisionEngine();
      const trace = new CollisionTrace(engine);
      trace.build();
      console.log(trace.render());
      console.log('');
    }
  } else {
    const engine = new CollisionEngine();
    const trace = new CollisionTrace(engine);
    trace.build();
    console.log(trace.render());
  }
}

if (require.main === module) {
  main();
}

module.exports = { CollisionTrace };
