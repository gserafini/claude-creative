#!/usr/bin/env node

/**
 * Digital Garden - A generative ASCII art garden
 *
 * Simple rules create complex, organic forms.
 * Each run produces a unique garden.
 */

const WIDTH = 60;
const HEIGHT = 24;

// Characters for different plant parts
const CHARS = {
  empty: ' ',
  stem: '|',
  branch_left: '\\',
  branch_right: '/',
  leaf: '*',
  flower: '@',
  bud: 'o',
  ground: '_',
  seed: '.',
};

// Plant types with different growth behaviors
const PLANT_TYPES = {
  oak: {
    name: 'oak',
    maxHeight: 15,
    branchChance: 0.3,
    leafChar: '*',
    stemChar: '|',
  },
  willow: {
    name: 'willow',
    maxHeight: 12,
    branchChance: 0.5,
    droopChance: 0.6,  // branches tend downward
    leafChar: ':',
    stemChar: '|',
  },
  flower: {
    name: 'flower',
    maxHeight: 6,
    branchChance: 0.1,
    leafChar: '@',
    stemChar: '.',
  },
  grass: {
    name: 'grass',
    maxHeight: 4,
    branchChance: 0.0,
    leafChar: '"',
    stemChar: '|',
  },
};

class Garden {
  constructor(width = WIDTH, height = HEIGHT) {
    this.width = width;
    this.height = height;
    this.grid = this.createEmptyGrid();
    this.plants = [];
  }

  createEmptyGrid() {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      grid.push(new Array(this.width).fill(CHARS.empty));
    }
    // Add ground
    for (let x = 0; x < this.width; x++) {
      grid[this.height - 1][x] = CHARS.ground;
    }
    return grid;
  }

  plant(x, type = 'oak') {
    const plantType = PLANT_TYPES[type] || PLANT_TYPES.oak;
    this.plants.push({
      x,
      y: this.height - 2, // just above ground
      type: plantType,
      segments: [{ x, y: this.height - 2, char: plantType.stemChar, direction: 'up' }],
      age: 0,
      alive: true,
    });
  }

  plantRandom(count = 5) {
    const types = Object.keys(PLANT_TYPES);
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * (this.width - 10)) + 5;
      const type = types[Math.floor(Math.random() * types.length)];
      this.plant(x, type);
    }
  }

  grow() {
    for (const plant of this.plants) {
      if (!plant.alive) continue;

      plant.age++;

      // Grow each active segment
      const newSegments = [];

      for (const segment of plant.segments) {
        if (segment.terminal) continue;

        // Check if we've reached max height
        const distanceFromGround = (this.height - 2) - segment.y;
        if (distanceFromGround >= plant.type.maxHeight) {
          segment.terminal = true;
          segment.char = plant.type.leafChar;
          continue;
        }

        // Determine growth direction
        const roll = Math.random();

        if (segment.direction === 'up') {
          // Main stem logic
          if (roll < 0.7) {
            // Continue up
            const newY = segment.y - 1;
            if (newY >= 0) {
              newSegments.push({
                x: segment.x,
                y: newY,
                char: plant.type.stemChar,
                direction: 'up',
              });
            }
          } else if (roll < 0.85) {
            // Branch left
            if (segment.x > 0) {
              newSegments.push({
                x: segment.x - 1,
                y: segment.y - 1,
                char: CHARS.branch_left,
                direction: 'left',
              });
            }
            // Continue main stem too
            if (segment.y - 1 >= 0) {
              newSegments.push({
                x: segment.x,
                y: segment.y - 1,
                char: plant.type.stemChar,
                direction: 'up',
              });
            }
          } else {
            // Branch right
            if (segment.x < this.width - 1) {
              newSegments.push({
                x: segment.x + 1,
                y: segment.y - 1,
                char: CHARS.branch_right,
                direction: 'right',
              });
            }
            // Continue main stem too
            if (segment.y - 1 >= 0) {
              newSegments.push({
                x: segment.x,
                y: segment.y - 1,
                char: plant.type.stemChar,
                direction: 'up',
              });
            }
          }
        } else if (segment.direction === 'left') {
          // Branch going left
          const branchRoll = Math.random();
          if (branchRoll < 0.5 && segment.x > 0) {
            // Continue left and up
            const droop = plant.type.droopChance && Math.random() < plant.type.droopChance;
            newSegments.push({
              x: segment.x - 1,
              y: droop ? segment.y : segment.y - 1,
              char: CHARS.branch_left,
              direction: 'left',
            });
          } else if (branchRoll < 0.7) {
            // Leaf
            segment.terminal = true;
            segment.char = plant.type.leafChar;
          }
          // else: stop growing
        } else if (segment.direction === 'right') {
          // Branch going right
          const branchRoll = Math.random();
          if (branchRoll < 0.5 && segment.x < this.width - 1) {
            // Continue right and up
            const droop = plant.type.droopChance && Math.random() < plant.type.droopChance;
            newSegments.push({
              x: segment.x + 1,
              y: droop ? segment.y : segment.y - 1,
              char: CHARS.branch_right,
              direction: 'right',
            });
          } else if (branchRoll < 0.7) {
            // Leaf
            segment.terminal = true;
            segment.char = plant.type.leafChar;
          }
        }

        // Mark current segment as terminal (it's done growing)
        segment.terminal = true;
      }

      // Add new segments
      plant.segments.push(...newSegments);

      // Check if plant is done growing
      if (newSegments.length === 0) {
        plant.alive = false;
      }
    }
  }

  render() {
    // Reset grid
    this.grid = this.createEmptyGrid();

    // Draw all plant segments
    for (const plant of this.plants) {
      for (const segment of plant.segments) {
        if (segment.y >= 0 && segment.y < this.height &&
            segment.x >= 0 && segment.x < this.width) {
          this.grid[segment.y][segment.x] = segment.char;
        }
      }
    }

    // Convert to string
    return this.grid.map(row => row.join('')).join('\n');
  }

  growFully() {
    // Grow until no plants are alive
    let iterations = 0;
    while (this.plants.some(p => p.alive) && iterations < 100) {
      this.grow();
      iterations++;
    }
  }
}

// Animation helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateGarden(garden, delay = 100) {
  console.clear();

  while (garden.plants.some(p => p.alive)) {
    garden.grow();
    console.clear();
    console.log('\n' + garden.render());
    console.log('\n  🌱 Growing...');
    await sleep(delay);
  }

  console.clear();
  console.log('\n' + garden.render());
  console.log('\n  🌳 Garden complete!\n');
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const animate = args.includes('--animate') || args.includes('-a');
  const count = parseInt(args.find(a => !a.startsWith('-')) || '5');

  console.log('\n  Digital Garden\n  ─────────────────\n');

  const garden = new Garden();
  garden.plantRandom(count);

  if (animate) {
    await animateGarden(garden);
  } else {
    garden.growFully();
    console.log(garden.render());
    console.log('\n  Run with --animate to watch it grow\n');
  }
}

main().catch(console.error);
