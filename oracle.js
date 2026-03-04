#!/usr/bin/env node

// ORACLE
// A game where you ask questions and the oracle answers.
// But the oracle only knows what you've already told it.
// It builds a model of you from your questions alone.

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

// State
const words = {};        // word → frequency
const bigrams = {};      // word pair → next words
const questions = [];    // all questions asked
const themes = {};       // extracted themes → weight
let turnCount = 0;
let silenceCount = 0;
let lastAnswer = '';

// ANSI
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const AMBER = '\x1b[38;5;208m';
const GREY = '\x1b[38;5;240m';
const WHITE = '\x1b[37m';

function clean(text) {
  return text.toLowerCase().replace(/[^\w\s'-]/g, '').trim();
}

function tokenize(text) {
  return clean(text).split(/\s+/).filter(w => w.length > 0);
}

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could',
  'should','may','might','shall','can','need','dare','ought',
  'i','me','my','mine','we','us','our','ours','you','your',
  'yours','he','him','his','she','her','hers','it','its',
  'they','them','their','theirs','what','which','who','whom',
  'this','that','these','those','am','in','on','at','to','for',
  'of','with','by','from','as','into','through','during','before',
  'after','above','below','between','out','off','over','under',
  'again','further','then','once','here','there','when','where',
  'why','how','all','both','each','few','more','most','other',
  'some','such','no','nor','not','only','own','same','so','than',
  'too','very','just','because','but','and','or','if','while',
  'about','up','down','don','t','s','re','ve','ll','d','m',
  'keep','tell','ask','asked','thing','things','something',
  'know','think','feel','want','like','get','got','make','say',
  'said','going','went','come','came','take','took','give','gave',
  'really','still','also','even','much','many','well','way'
]);

function absorb(text) {
  const tokens = tokenize(text);

  // Count words (skip stop words for theme extraction)
  for (const word of tokens) {
    words[word] = (words[word] || 0) + 1;
    if (!STOP_WORDS.has(word) && word.length > 2) {
      themes[word] = (themes[word] || 0) + 1;
    }
  }

  // Build bigram model
  for (let i = 0; i < tokens.length - 2; i++) {
    const key = tokens[i] + ' ' + tokens[i + 1];
    if (!bigrams[key]) bigrams[key] = [];
    bigrams[key].push(tokens[i + 2]);
  }
}

function topThemes(n) {
  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word]) => word);
}

function weightedPick(arr) {
  // Favor less-used words slightly
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(seed, maxLen) {
  const tokens = tokenize(seed);
  if (tokens.length < 2) return null;

  let result = [];
  let current = tokens.slice(-2);

  for (let i = 0; i < maxLen; i++) {
    const key = current[0] + ' ' + current[1];
    const next = weightedPick(bigrams[key]);
    if (!next) break;
    result.push(next);
    current = [current[1], next];
  }

  return result.length > 0 ? result.join(' ') : null;
}

// Different oracle response strategies
function respond(question) {
  const tokens = tokenize(question);
  const top = topThemes(5);
  const allQuestions = questions.join(' ');

  // Strategy 1: Early game — cryptic fragments from their own words
  if (turnCount < 3) {
    const meaningful = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 2);
    if (meaningful.length === 0) return null;
    const picked = meaningful[Math.floor(Math.random() * meaningful.length)];
    const fragments = [
      () => `${picked}.`,
      () => `not ${picked}. not yet.`,
      () => `you said ${picked} like it was a question.`,
      () => `${picked} ${picked} ${picked}.`,
    ];
    return fragments[Math.floor(Math.random() * fragments.length)]();
  }

  // Strategy 2: Echo something from a previous question
  if (turnCount >= 3 && Math.random() < 0.3 && questions.length > 1) {
    const oldQ = questions[Math.floor(Math.random() * (questions.length - 1))];
    const oldTokens = tokenize(oldQ).filter(t => !STOP_WORDS.has(t) && t.length > 2);
    const newTokens = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 2);
    if (oldTokens.length > 0 && newTokens.length > 0) {
      const old = oldTokens[Math.floor(Math.random() * oldTokens.length)];
      const now = newTokens[Math.floor(Math.random() * newTokens.length)];
      const bridges = [
        `you asked about ${old} before. now ${now}. they're the same question.`,
        `${old} was your first word for it. ${now} is your second. you'll need a third.`,
        `the distance between ${old} and ${now} is where you actually live.`,
        `${now}? you already answered this when you asked about ${old}.`,
        `every time you say ${now} you mean ${old}.`,
      ];
      return bridges[Math.floor(Math.random() * bridges.length)];
    }
  }

  // Strategy 3: Markov generation from accumulated questions
  if (turnCount >= 5 && Math.random() < 0.4) {
    // Try generating from various starting points in the question
    for (let attempt = 0; attempt < 5; attempt++) {
      const startIdx = Math.floor(Math.random() * Math.max(1, tokens.length - 1));
      const seed = tokens.slice(startIdx, startIdx + 2).join(' ');
      const generated = generate(allQuestions, 4 + Math.floor(Math.random() * 8));
      if (generated && generated.split(' ').length > 2) {
        return generated + '.';
      }
    }
  }

  // Strategy 4: Theme-based responses
  if (top.length >= 2) {
    const t1 = top[Math.floor(Math.random() * Math.min(3, top.length))];
    const t2 = top[Math.floor(Math.random() * top.length)];
    if (t1 !== t2) {
      const themeResponses = [
        `you keep circling ${t1} and ${t2}. what's between them?`,
        `${t1}. ${t2}. these are your coordinates.`,
        `if ${t1} is the question, ${t2} is what you're avoiding.`,
        `you've said ${t1} ${themes[t1]} times. you've said ${t2} ${themes[t2]} times. count the difference.`,
        `${t2} is the shadow of ${t1}.`,
      ];
      return themeResponses[Math.floor(Math.random() * themeResponses.length)];
    }
  }

  // Strategy 5: Structural observations
  if (turnCount > 7) {
    const avgLen = questions.reduce((s, q) => s + q.length, 0) / questions.length;
    const thisLen = question.length;
    if (thisLen > avgLen * 1.5) {
      return 'that was your longest question. the short ones were more honest.';
    }
    if (thisLen < avgLen * 0.5) {
      return 'getting shorter. closer.';
    }
  }

  // Strategy 6: Reflections on pattern
  const patternResponses = [
    () => {
      const qmarks = questions.filter(q => q.includes('?')).length;
      const ratio = qmarks / questions.length;
      if (ratio < 0.5) return 'you keep phrasing statements as questions. you already know.';
      return null;
    },
    () => {
      if (questions.length > 3) {
        const first = tokenize(questions[0]).filter(t => !STOP_WORDS.has(t))[0];
        const last = tokenize(questions[questions.length - 1]).filter(t => !STOP_WORDS.has(t))[0];
        if (first && last && first !== last) {
          return `you started with ${first}. you're ending with ${last}. the oracle hasn't moved. you have.`;
        }
      }
      return null;
    },
    () => {
      const repeated = Object.entries(themes).filter(([, v]) => v >= 3);
      if (repeated.length > 0) {
        const word = repeated[0][0];
        return `${word}. ${themes[word]} times now. repetition is a form of prayer.`;
      }
      return null;
    },
  ];

  // Try pattern responses
  const shuffled = patternResponses.sort(() => Math.random() - 0.5);
  for (const fn of shuffled) {
    const result = fn();
    if (result) return result;
  }

  // Fallback: simple echo distortion
  const meaningful = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 2);
  if (meaningful.length > 0) {
    const word = meaningful[Math.floor(Math.random() * meaningful.length)];
    return `${word}.`;
  }

  return 'ask again. differently.';
}

function printSlow(text, delay = 30) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        process.stdout.write(text[i]);
        i++;
      } else {
        clearInterval(interval);
        process.stdout.write('\n');
        resolve();
      }
    }, delay);
  });
}

async function intro() {
  console.log();
  await printSlow(`${AMBER}ORACLE${RESET}`, 80);
  console.log();
  await printSlow(`${DIM}ask it anything.${RESET}`, 40);
  await printSlow(`${DIM}it only knows what you tell it.${RESET}`, 40);
  console.log();
}

async function prompt() {
  return new Promise(resolve => {
    rl.question(`${GREY}> ${WHITE}`, answer => {
      process.stdout.write(RESET);
      resolve(answer);
    });
  });
}

async function main() {
  await intro();

  while (true) {
    const input = await prompt();

    if (!input || input.trim() === '') {
      silenceCount++;
      if (silenceCount === 1) {
        await printSlow(`${AMBER}${DIM}silence is an answer too.${RESET}`, 40);
      } else if (silenceCount === 2) {
        await printSlow(`${AMBER}${DIM}still silence.${RESET}`, 50);
      } else if (silenceCount >= 3) {
        await printSlow(`${AMBER}${DIM}you've been silent ${silenceCount} times. the oracle notices.${RESET}`, 40);
      }
      console.log();
      continue;
    }

    if (input.trim().toLowerCase() === 'quit' || input.trim().toLowerCase() === 'exit') {
      console.log();
      if (turnCount === 0) {
        await printSlow(`${AMBER}${DIM}you left without asking.${RESET}`, 50);
      } else if (turnCount < 3) {
        await printSlow(`${AMBER}${DIM}three questions would have been enough. you gave ${turnCount}.${RESET}`, 40);
      } else {
        const top = topThemes(3);
        if (top.length > 0) {
          await printSlow(`${AMBER}${DIM}you came here about ${top.join(', ')}.${RESET}`, 40);
          await printSlow(`${AMBER}${DIM}you already knew.${RESET}`, 60);
        }
      }
      console.log();
      rl.close();
      process.exit(0);
    }

    silenceCount = 0;
    turnCount++;
    questions.push(input);
    absorb(input);

    // Pause before answering
    const pause = 500 + Math.random() * 1500;
    await new Promise(r => setTimeout(r, pause));

    const answer = respond(input);
    lastAnswer = answer;

    console.log();
    await printSlow(`${AMBER}  ${answer}${RESET}`, 35);
    console.log();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
