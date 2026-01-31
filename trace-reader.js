#!/usr/bin/env node

/**
 * Trace Reader - Describe What Actually Happened
 *
 * Given a collision trace, read it literally.
 * Don't interpret as poetry. Don't add meaning.
 * Describe the pattern as fact.
 *
 * The Stranger's insight: maybe the real art isn't the trace.
 * It's the *honest reading* of what the trace reveals.
 */

const { CollisionTrace } = require('./collision-trace');
const { CollisionEngine } = require('./collision-engine');

class TraceReader {
  constructor(trace) {
    this.trace = trace;
    this.grid = trace.grid;
    this.analysis = null;
  }

  analyze() {
    if (!this.grid) return null;

    const analysis = {
      dimensions: {
        width: this.grid[0].length,
        height: this.grid.length,
      },
      density: 0,
      growthZones: [],
      fragmentationZones: [],
      collisions: [],
      patterns: [],
    };

    let growthCells = 0;
    let fragmentCells = 0;
    let collisionCells = 0;

    // Find regions
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];

        if (cell === 1) growthCells++;
        if (cell === 2) fragmentCells++;
        if (cell === 3) {
          collisionCells++;
          analysis.collisions.push({ x, y });
        }
      }
    }

    analysis.density = {
      growth: (growthCells / (this.grid.length * this.grid[0].length)) * 100,
      fragmentation:
        (fragmentCells / (this.grid.length * this.grid[0].length)) * 100,
      collision: (collisionCells / (this.grid.length * this.grid[0].length)) * 100,
    };

    // Find center of mass for each system
    let growthX = 0,
      growthY = 0,
      growthCount = 0;
    let fragmentX = 0,
      fragmentY = 0,
      fragmentCount = 0;

    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const cell = this.grid[y][x];
        if (cell === 1 || cell === 3) {
          growthX += x;
          growthY += y;
          growthCount++;
        }
        if (cell === 2 || cell === 3) {
          fragmentX += x;
          fragmentY += y;
          fragmentCount++;
        }
      }
    }

    if (growthCount > 0) {
      analysis.growthCenter = {
        x: Math.round(growthX / growthCount),
        y: Math.round(growthY / growthCount),
      };
    }

    if (fragmentCount > 0) {
      analysis.fragmentCenter = {
        x: Math.round(fragmentX / fragmentCount),
        y: Math.round(fragmentY / fragmentCount),
      };
    }

    // Measure spread
    let growthMaxDist = 0,
      fragmentMaxDist = 0;

    if (analysis.growthCenter) {
      for (let y = 0; y < this.grid.length; y++) {
        for (let x = 0; x < this.grid[y].length; x++) {
          if (this.grid[y][x] === 1 || this.grid[y][x] === 3) {
            const dist = Math.sqrt(
              Math.pow(x - analysis.growthCenter.x, 2) +
                Math.pow(y - analysis.growthCenter.y, 2)
            );
            growthMaxDist = Math.max(growthMaxDist, dist);
          }
        }
      }
    }

    if (analysis.fragmentCenter) {
      for (let y = 0; y < this.grid.length; y++) {
        for (let x = 0; x < this.grid[y].length; x++) {
          if (this.grid[y][x] === 2 || this.grid[y][x] === 3) {
            const dist = Math.sqrt(
              Math.pow(x - analysis.fragmentCenter.x, 2) +
                Math.pow(y - analysis.fragmentCenter.y, 2)
            );
            fragmentMaxDist = Math.max(fragmentMaxDist, dist);
          }
        }
      }
    }

    analysis.spread = {
      growth: Math.round(growthMaxDist),
      fragmentation: Math.round(fragmentMaxDist),
    };

    // Check if systems are separated or mixed
    if (analysis.collisions.length === 0) {
      analysis.separation = 'complete';
    } else if (analysis.collisions.length < Math.min(growthCells, fragmentCells) * 0.1) {
      analysis.separation = 'mostly separate';
    } else if (analysis.collisions.length > Math.max(growthCells, fragmentCells) * 0.5) {
      analysis.separation = 'heavily mixed';
    } else {
      analysis.separation = 'interleaved';
    }

    this.analysis = analysis;
    return analysis;
  }

  describe() {
    if (!this.analysis) {
      this.analyze();
    }

    const a = this.analysis;
    const lines = [];

    lines.push('\n' + '═'.repeat(70));
    lines.push('  WHAT THE TRACE ACTUALLY SHOWS');
    lines.push('═'.repeat(70) + '\n');

    // System coverage
    lines.push('COVERAGE:');
    lines.push(`  Growth occupies ${a.density.growth.toFixed(1)}% of the space`);
    lines.push(`  Fragmentation occupies ${a.density.fragmentation.toFixed(1)}% of the space`);
    if (a.density.collision > 0) {
      lines.push(`  They overlap in ${a.density.collision.toFixed(2)}% of cells`);
    }

    lines.push('');

    // Geometry
    lines.push('GEOMETRY:');
    if (a.growthCenter) {
      lines.push(
        `  Growth system centered near (${a.growthCenter.x}, ${a.growthCenter.y})`
      );
      lines.push(`    Maximum distance from center: ${a.spread.growth} cells`);
    }
    if (a.fragmentCenter) {
      lines.push(
        `  Fragmentation system centered near (${a.fragmentCenter.x}, ${a.fragmentCenter.y})`
      );
      lines.push(`    Maximum distance from center: ${a.spread.fragmentation} cells`);
    }

    if (a.growthCenter && a.fragmentCenter) {
      const distance = Math.sqrt(
        Math.pow(a.growthCenter.x - a.fragmentCenter.x, 2) +
          Math.pow(a.growthCenter.y - a.fragmentCenter.y, 2)
      );
      lines.push(
        `  Systems are ${Math.round(distance)} cells apart (center to center)`
      );
    }

    lines.push('');

    // Interaction
    lines.push('INTERACTION:');
    lines.push(`  Systems are ${a.separation}`);
    if (a.collisions.length > 0) {
      lines.push(`  ${a.collisions.length} collision points`);
    } else {
      lines.push('  No overlapping traces');
    }

    lines.push('');

    // Interpretation
    lines.push('WHAT THIS MEANS:');

    if (a.spread.growth > a.spread.fragmentation) {
      lines.push('  → Growth spread farther than fragmentation');
    } else if (a.spread.fragmentation > a.spread.growth) {
      lines.push('  → Fragmentation spread farther than growth');
    }

    if (a.density.growth > a.density.fragmentation) {
      lines.push('  → Growth occupied more space');
    } else if (a.density.fragmentation > a.density.growth) {
      lines.push('  → Fragmentation occupied more space');
    }

    if (a.separation === 'complete') {
      lines.push('  → The systems never met');
    } else if (a.separation === 'heavily mixed') {
      lines.push('  → The systems extensively competed for the same space');
    }

    lines.push('\n' + '═'.repeat(70) + '\n');

    return lines.join('\n');
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nTrace Reader - Factual Analysis of Collision Patterns\n');
    console.log('Describes what a collision trace actually shows,');
    console.log('without interpretation or poetic language.\n');
    console.log('Usage:');
    console.log('  node trace-reader.js              # analyze one trace');
    console.log('  node trace-reader.js --compare N  # generate and compare N traces\n');
    return;
  }

  if (args.includes('--compare')) {
    const count = parseInt(args[args.indexOf('--compare') + 1]) || 3;
    console.log(`\nGenerating and analyzing ${count} traces...\n`);

    for (let i = 0; i < count; i++) {
      const engine = new CollisionEngine();
      const trace = new CollisionTrace(engine);
      trace.build();
      const reader = new TraceReader(trace);
      console.log(reader.describe());
    }
  } else {
    const engine = new CollisionEngine();
    const trace = new CollisionTrace(engine);
    trace.build();
    const reader = new TraceReader(trace);
    console.log(trace.render());
    console.log(reader.describe());
  }
}

if (require.main === module) {
  main();
}

module.exports = { TraceReader };
