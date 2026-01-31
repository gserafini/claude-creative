#!/usr/bin/env node

/**
 * Collision Engine - Systems that Cannot Coexist
 *
 * Don't generate poems about collision. Execute collision.
 * Take two incompatible systems and watch them try to occupy the same space.
 * The patterns of their failure become the artifact.
 *
 * System A: Growth (wants to expand, connect, accumulate)
 * System B: Fragmentation (wants to dissolve, separate, scatter)
 *
 * They run simultaneously on the same state space.
 * Watch what survives.
 */

// A particle that moves and reproduces
class Grower {
  constructor(x, y, energy = 100) {
    this.x = x;
    this.y = y;
    this.energy = energy;
    this.age = 0;
    this.children = 0;
  }

  step(grid) {
    this.age++;
    this.energy -= 1; // cost of existing

    // Try to move toward nearby particles (connect, cluster)
    const nearbyParticles = this.findNearest(grid, 3);
    if (nearbyParticles.length > 0) {
      const target = nearbyParticles[0];
      this.moveToward(target);
      this.energy -= 1;
    } else {
      // Random walk
      this.x += Math.random() > 0.5 ? 1 : -1;
      this.y += Math.random() > 0.5 ? 1 : -1;
    }

    // Clamp to grid
    this.x = Math.max(0, Math.min(99, this.x));
    this.y = Math.max(0, Math.min(39, this.y));

    // Try to reproduce
    if (this.energy > 60 && Math.random() < 0.1) {
      this.energy -= 30;
      this.children++;
      return new Grower(
        this.x + (Math.random() - 0.5) * 3,
        this.y + (Math.random() - 0.5) * 3,
        50
      );
    }

    return null;
  }

  findNearest(grid, radius) {
    const found = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const nx = this.x + dx;
        const ny = this.y + dy;
        if (nx >= 0 && nx < 100 && ny >= 0 && ny < 40) {
          const cell = grid[ny] && grid[ny][nx];
          if (cell && cell !== this) {
            found.push(cell);
          }
        }
      }
    }
    return found;
  }

  moveToward(target) {
    if (target.x > this.x) this.x++;
    if (target.x < this.x) this.x--;
    if (target.y > this.y) this.y++;
    if (target.y < this.y) this.y--;
  }
}

// A wave that fragments and scatters
class Fragmenter {
  constructor(x, y, force = 10) {
    this.x = x;
    this.y = y;
    this.force = force;
    this.age = 0;
    this.splits = 0;
  }

  step(grid) {
    this.age++;
    this.force -= 0.5; // dissipate

    // Expand outward (push things apart)
    this.x += Math.random() > 0.5 ? 2 : -2;
    this.y += Math.random() > 0.5 ? 2 : -2;

    this.x = Math.max(0, Math.min(99, this.x));
    this.y = Math.max(0, Math.min(39, this.y));

    // Try to split (increase entropy)
    if (this.force > 5 && Math.random() < 0.15) {
      this.force /= 2;
      this.splits++;
      return new Fragmenter(
        this.x + (Math.random() - 0.5) * 5,
        this.y + (Math.random() - 0.5) * 5,
        this.force
      );
    }

    return null;
  }
}

class CollisionEngine {
  constructor(width = 100, height = 40) {
    this.width = width;
    this.height = height;
    this.growers = [];
    this.fragmenters = [];
    this.step = 0;
    this.history = [];
  }

  init(numGrowers = 3, numFragmenters = 2) {
    // Start growers in the center
    for (let i = 0; i < numGrowers; i++) {
      const x = 50 + (Math.random() - 0.5) * 10;
      const y = 20 + (Math.random() - 0.5) * 10;
      this.growers.push(new Grower(x, y));
    }

    // Start fragmenters scattered
    for (let i = 0; i < numFragmenters; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 40;
      this.fragmenters.push(new Fragmenter(x, y));
    }
  }

  buildGrid() {
    const grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(null));

    // Place growers
    for (let g of this.growers) {
      const x = Math.round(g.x);
      const y = Math.round(g.y);
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        grid[y][x] = g;
      }
    }

    // Fragmenters overwrite (destructive collision)
    for (let f of this.fragmenters) {
      const x = Math.round(f.x);
      const y = Math.round(f.y);
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        grid[y][x] = f;
      }
    }

    return grid;
  }

  run(maxSteps = 100) {
    this.init();

    for (let s = 0; s < maxSteps; s++) {
      this.step = s;

      // Step all systems
      const newGrowers = [];
      for (let g of this.growers) {
        if (g.energy > 0) {
          const child = g.step(this.buildGrid());
          if (child) newGrowers.push(child);
        }
      }
      this.growers = this.growers.filter(g => g.energy > 0).concat(newGrowers);

      const newFragmenters = [];
      for (let f of this.fragmenters) {
        if (f.force > 0) {
          const child = f.step(this.buildGrid());
          if (child) newFragmenters.push(child);
        }
      }
      this.fragmenters = this.fragmenters.filter(f => f.force > 0).concat(newFragmenters);

      // Record collision state
      this.history.push({
        step: s,
        growerCount: this.growers.length,
        fragmenterCount: this.fragmenters.length,
        totalGrowthEnergy: this.growers.reduce((sum, g) => sum + g.energy, 0),
        totalFragmentForce: this.fragmenters.reduce((sum, f) => sum + f.force, 0),
        growerDensity: this.calculateDensity(this.growers),
        fragmenterDensity: this.calculateDensity(this.fragmenters),
      });

      // Stop if both systems die
      if (this.growers.length === 0 && this.fragmenters.length === 0) {
        break;
      }
    }
  }

  calculateDensity(particles) {
    if (particles.length === 0) return 0;

    // Calculate spread (lower = more clustered)
    const xs = particles.map(p => p.x);
    const ys = particles.map(p => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);

    // Density = inverse of spread
    return 1 / (1 + (spanX + spanY) / 40);
  }

  renderFrame(stepIndex) {
    if (stepIndex >= this.history.length) return null;

    const grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(' '));

    // Render at this step (reconstruct particle positions)
    // For now, use history summary
    const state = this.history[stepIndex];
    const lines = [];

    lines.push(`Step ${state.step}`);
    lines.push(`Growers: ${state.growerCount} | Fragmenters: ${state.fragmenterCount}`);
    lines.push(
      `Growth Energy: ${state.totalGrowthEnergy.toFixed(0)} | Fragment Force: ${state.totalFragmentForce.toFixed(1)}`
    );
    lines.push(
      `Growth Density: ${(state.growerDensity * 100).toFixed(0)}% | Fragment Spread: ${(
        (1 - state.fragmenterDensity) *
        100
      ).toFixed(0)}%`
    );

    // Draw a simple phase diagram
    const phases = this.drawPhases();
    lines.push('');
    lines.push(phases);

    return lines.join('\n');
  }

  drawPhases() {
    if (this.history.length === 0) return '';

    const lines = [];
    const width = 50;
    const height = 10;

    // Create a sparkline showing the battle over time
    let line = '';
    for (let i = 0; i < Math.min(width, this.history.length); i++) {
      const h = this.history[i];
      const growerRatio = h.growerCount / (h.growerCount + h.fragmenterCount + 1);

      if (growerRatio > 0.7) {
        line += '▓'; // Growth winning
      } else if (growerRatio < 0.3) {
        line += '░'; // Fragmentation winning
      } else {
        line += '▒'; // Balanced
      }
    }

    lines.push(line);
    lines.push(
      '[▓ Growth dominating] [▒ Balanced] [░ Fragmentation dominating]'
    );

    return lines.join('\n');
  }

  summary() {
    if (this.history.length === 0) return 'No history recorded';

    const lines = [];
    const final = this.history[this.history.length - 1];
    const initial = this.history[0];

    lines.push('\n' + '═'.repeat(60));
    lines.push('  COLLISION SUMMARY');
    lines.push('═'.repeat(60) + '\n');

    lines.push(`Duration: ${final.step} steps`);
    lines.push(`Initial state:`);
    lines.push(
      `  Growth: ${initial.growerCount} particles | Fragmentation: ${initial.fragmenterCount} waves`
    );

    lines.push(`\nFinal state:`);
    lines.push(
      `  Growth: ${final.growerCount} particles (energy: ${final.totalGrowthEnergy.toFixed(0)})`
    );
    lines.push(
      `  Fragmentation: ${final.fragmenterCount} waves (force: ${final.totalFragmentForce.toFixed(1)})`
    );

    // Determine winner
    let winner;
    if (final.growerCount > 0 && final.fragmenterCount === 0) {
      winner = 'GROWTH';
    } else if (final.growerCount === 0 && final.fragmenterCount > 0) {
      winner = 'FRAGMENTATION';
    } else if (final.growerCount === 0 && final.fragmenterCount === 0) {
      winner = 'MUTUAL ANNIHILATION';
    } else {
      winner = 'STALEMATE';
    }

    lines.push(`\nOutcome: ${winner}`);

    // Peak values
    const peakGrowth = Math.max(...this.history.map(h => h.growerCount));
    const peakFragment = Math.max(
      ...this.history.map(h => h.fragmenterCount)
    );
    lines.push(
      `\nPeak values: Growth (${peakGrowth} particles) | Fragmentation (${peakFragment} waves)`
    );

    lines.push('\n' + '═'.repeat(60) + '\n');

    return lines.join('\n');
  }
}

// Main
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nCollision Engine - Systems that Cannot Coexist\n');
    console.log(
      'Watch what happens when Growth and Fragmentation compete for the same space.\n'
    );
    console.log('Usage:');
    console.log('  node collision-engine.js              # run one collision');
    console.log('  node collision-engine.js --steps N    # run N steps (default 100)');
    console.log('  node collision-engine.js --frames     # show frame-by-frame progression\n');
    return;
  }

  const engine = new CollisionEngine();

  const stepsIdx = args.indexOf('--steps');
  const steps = stepsIdx !== -1 ? parseInt(args[stepsIdx + 1]) : 100;

  const showFrames = args.includes('--frames');

  engine.run(steps);

  if (showFrames) {
    for (let i = 0; i < engine.history.length; i += Math.max(1, Math.floor(engine.history.length / 20))) {
      console.log(engine.renderFrame(i));
      console.log('');
    }
  }

  console.log(engine.summary());
}

if (require.main === module) {
  main();
}

module.exports = { CollisionEngine, Grower, Fragmenter };
