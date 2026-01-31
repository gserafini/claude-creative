#!/usr/bin/env node

/**
 * Collision - Poetry from incompatible domains
 *
 * Don't curate good phrases. Instead: force language from two
 * unrelated concepts into the same space. The collision creates
 * meaning you didn't plan.
 */

const CONCEPTS = {
  emergence: ['one cell', 'becomes flock', 'no plan for flight', 'first snow', 'new leaf', 'spreads beyond'],
  discontinuity: ['whole thread', 'snaps sudden', 'what remains', 'bright pulse', 'goes dark', 'scattered trace'],
  time: ['sun climbs slow', 'stone sits still', 'always changing', 'tide pulls back', 'never returns', 'circles forward'],
  nature: ['oak stands old', 'branches seek light', 'green turns gold', 'moss claims stone', 'roots grip deep', 'frost becomes thaw'],
  void: ['empty page', 'nothing answers', 'silence spreads', 'no echo comes', 'space holds still', 'blank awaits']
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo(arr) {
  const first = Math.floor(Math.random() * arr.length);
  let second = Math.floor(Math.random() * arr.length);
  while (second === first) {
    second = Math.floor(Math.random() * arr.length);
  }
  return [arr[first], arr[second]];
}

/**
 * Generate a three-line poem by forcing two incompatible concepts together.
 * Line 1 from concept A.
 * Line 2 hybrid: one phrase from A, one from B.
 * Line 3 from concept B.
 */
function generateCollision(conceptA, conceptB) {
  const phrases1 = CONCEPTS[conceptA];
  const phrases2 = CONCEPTS[conceptB];

  if (!phrases1 || !phrases2) {
    throw new Error(`Unknown concept. Available: ${Object.keys(CONCEPTS).join(', ')}`);
  }

  const line1 = pick(phrases1);

  // Middle line: interleave or juxtapose
  const [phrase1, phrase2] = pickTwo(phrases1);
  const [phraseA, phraseB] = pickTwo(phrases2);
  const line2 = [
    `${phrase1}, ${phraseB}`,
    `${phraseA} but ${phrase2}`,
    `${phrase1} while ${phraseA}`
  ][Math.floor(Math.random() * 3)];

  const line3 = pick(phrases2);

  return {
    conceptA,
    conceptB,
    collision: `${conceptA} ↔ ${conceptB}`,
    lines: [line1, line2, line3]
  };
}

function display(poem) {
  console.log('\n' + '═'.repeat(50));
  console.log('  ' + poem.collision);
  console.log('═'.repeat(50) + '\n');

  poem.lines.forEach((line, i) => {
    const indent = i === 1 ? '  ' : '';
    console.log(indent + line);
  });

  console.log('\n' + '═'.repeat(50) + '\n');
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nCollision - Poetry from incompatible domains\n');
    console.log('Usage:');
    console.log('  node collision.js [concept1] [concept2]\n');
    console.log('Concepts:');
    Object.keys(CONCEPTS).forEach(c => console.log(`  ${c}`));
    console.log('\nExamples:');
    console.log('  node collision.js emergence time');
    console.log('  node collision.js nature void');
    console.log('  node collision.js                # random collision\n');
    return;
  }

  const conceptNames = Object.keys(CONCEPTS);
  let concept1 = args[0];
  let concept2 = args[1];

  if (!conceptNames.includes(concept1)) {
    concept1 = pick(conceptNames);
  }
  if (!conceptNames.includes(concept2) || concept2 === concept1) {
    let second = pick(conceptNames);
    while (second === concept1) {
      second = pick(conceptNames);
    }
    concept2 = second;
  }

  const poem = generateCollision(concept1, concept2);
  display(poem);
}

if (require.main === module) {
  main();
}

module.exports = { generateCollision, CONCEPTS };
