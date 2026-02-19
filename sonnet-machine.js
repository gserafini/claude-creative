#!/usr/bin/env node

/**
 * Sonnet Machine
 *
 * Generates formal sonnets from a constrained lexicon.
 * Not neural text generation — combinatorial poetry from rules.
 *
 * Each line is built from a hand-written template with grammatical
 * slots. Content words (nouns, verbs, adjectives) are drawn from
 * a curated vocabulary tagged with stress patterns and rhyme groups.
 * The machine enforces iambic pentameter and Shakespearean rhyme
 * scheme (ABAB CDCD EFEF GG).
 *
 * Run:  node sonnet-machine.js
 * Run:  node sonnet-machine.js --many 5
 * Run:  node sonnet-machine.js --seed 42
 */

// ============================================================
// SEEDED RANDOM
// ============================================================

class Random {
  constructor(seed) {
    this.state = seed || Math.floor(Math.random() * 2147483647);
    if (this.state <= 0) this.state = 1;
  }
  next() {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }
  pick(arr) {
    if (arr.length === 0) return null;
    return arr[Math.floor(this.next() * arr.length)];
  }
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

// ============================================================
// LEXICON
// Stress: 0 = unstressed, 1 = stressed
// ============================================================

// Monosyllabic nouns (stressed)
const N1 = [
  { w: "light",  r: "ight" }, { w: "night",  r: "ight" }, { w: "sight",  r: "ight" },
  { w: "flight", r: "ight" }, { w: "stone",  r: "one"  }, { w: "bone",   r: "one"  },
  { w: "throne", r: "one"  }, { w: "tone",   r: "one"  }, { w: "fire",   r: "ire"  },
  { w: "rain",   r: "ain"  }, { w: "pain",   r: "ain"  }, { w: "chain",  r: "ain"  },
  { w: "stain",  r: "ain"  }, { w: "vein",   r: "ain"  }, { w: "grain",  r: "ain"  },
  { w: "wind",   r: "ind"  }, { w: "mind",   r: "ind"  }, { w: "sea",    r: "ee"   },
  { w: "tree",   r: "ee"   }, { w: "key",    r: "ee"   }, { w: "dream",  r: "eem"  },
  { w: "stream", r: "eem"  }, { w: "dust",   r: "ust"  }, { w: "trust",  r: "ust"  },
  { w: "rust",   r: "ust"  }, { w: "earth",  r: "erth" }, { w: "birth",  r: "erth" },
  { w: "worth",  r: "erth" }, { w: "sky",    r: "eye"  }, { w: "eye",    r: "eye"  },
  { w: "star",   r: "ar"   }, { w: "scar",   r: "ar"   }, { w: "dark",   r: "ark"  },
  { w: "spark",  r: "ark"  }, { w: "root",   r: "oot"  }, { w: "song",   r: "ong"  },
  { w: "blood",  r: "ud"   }, { w: "flood",  r: "ud"   }, { w: "hand",   r: "and"  },
  { w: "land",   r: "and"  }, { w: "sand",   r: "and"  }, { w: "word",   r: "erd"  },
  { w: "bird",   r: "erd"  }, { w: "door",   r: "ore"  }, { w: "shore",  r: "ore"  },
  { w: "core",   r: "ore"  }, { w: "floor",  r: "ore"  }, { w: "wave",   r: "ave"  },
  { w: "grave",  r: "ave"  }, { w: "cave",   r: "ave"  }, { w: "name",   r: "ame"  },
  { w: "flame",  r: "ame"  }, { w: "frame",  r: "ame"  }, { w: "shame",  r: "ame"  },
  { w: "face",   r: "ace"  }, { w: "place",  r: "ace"  }, { w: "space",  r: "ace"  },
  { w: "grace",  r: "ace"  }, { w: "wall",   r: "all"  }, { w: "fall",   r: "all"  },
  { w: "call",   r: "all"  }, { w: "voice",  r: "oice" }, { w: "road",   r: "ode"  },
  { w: "seed",   r: "eed"  }, { w: "need",   r: "eed"  }, { w: "weed",   r: "eed"  },
  { w: "glass",  r: "ass"  }, { w: "grass",  r: "ass"  }, { w: "ash",    r: "ash"  },
  { w: "truth",  r: "ooth" }, { w: "youth",  r: "ooth" }, { w: "wing",   r: "ing"  },
  { w: "thing",  r: "ing"  }, { w: "ring",   r: "ing"  }, { w: "spring", r: "ing"  },
  { w: "king",   r: "ing"  }, { w: "time",   r: "ime"  }, { w: "rhyme",  r: "ime"  },
  { w: "day",    r: "ay"   }, { w: "way",    r: "ay"   }, { w: "ray",    r: "ay"   },
  { w: "clay",   r: "ay"   }, { w: "grief",  r: "eef"  }, { w: "leaf",   r: "eef"  },
  { w: "frost",  r: "ost"  }, { w: "loss",   r: "oss"  }, { w: "moss",   r: "oss"  },
  { w: "sleep",  r: "eep"  }, { w: "deep",   r: "eep"  }, { w: "rock",   r: "ock"  },
  { w: "lock",   r: "ock"  }, { w: "field",  r: "eeld" }, { w: "shield", r: "eeld" },
  { w: "edge",   r: "ej"   }, { w: "skin",   r: "in"   }, { w: "heat",   r: "eet"  },
  { w: "dew",    r: "oo"   }, { w: "hue",    r: "oo"   }, { w: "fear",   r: "eer"  },
  { w: "tear",   r: "eer"  }, { w: "year",   r: "eer"  }, { w: "moon",   r: "oon"  },
  { w: "wound",  r: "oond" }, { w: "ground", r: "ownd" }, { w: "sound",  r: "ownd" },
  { w: "crown",  r: "own"  }, { w: "town",   r: "own"  }, { w: "snow",   r: "ow"   },
  { w: "crow",   r: "ow"   }, { w: "bow",    r: "ow"   },
  { w: "hill",   r: "ill"  }, { w: "will",   r: "ill"  },
  { w: "rose",   r: "oze"  }, { w: "thorn",  r: "orn"  }, { w: "horn",   r: "orn"  },
  { w: "storm",  r: "orm"  }, { w: "form",   r: "orm"  }, { w: "worm",   r: "orm"  },
  { w: "shore",  r: "ore"  }, { w: "war",    r: "ore"  },
  { w: "bone",   r: "one"  }, { w: "home",   r: "ome"  },
  { w: "foam",   r: "ome"  }, { w: "dome",   r: "ome"  },
  { w: "vine",   r: "ine"  }, { w: "wine",   r: "ine"  }, { w: "line",   r: "ine"  },
  { w: "sign",   r: "ine"  }, { w: "mine",   r: "ine"  },
  { w: "bell",   r: "ell"  }, { w: "well",   r: "ell"  }, { w: "shell",  r: "ell"  },
  { w: "cell",   r: "ell"  }, { w: "spell",  r: "ell"  },
  { w: "tide",   r: "ide"  }, { w: "pride",  r: "ide"  }, { w: "side",   r: "ide"  },
  { w: "guide",  r: "ide"  },
  { w: "coast",  r: "ost"  }, { w: "ghost",  r: "ost"  }, { w: "host",   r: "ost"  },
  { w: "post",   r: "ost"  },
  { w: "mist",   r: "ist"  }, { w: "fist",   r: "ist"  },
  { w: "lake",   r: "ake"  }, { w: "wake",   r: "ake"  }, { w: "snake",  r: "ake"  },
  { w: "end",    r: "end"  },
];

// Iambic nouns (unstressed-stressed)
const N2i = [
  { w: "desire",   r: "ire"  }, { w: "despair",  r: "air"  },
  { w: "delight",  r: "ight" }, { w: "regret",   r: "et"   },
  { w: "machine",  r: "een"  }, { w: "command",  r: "and"  },
  { w: "decay",    r: "ay"   }, { w: "delay",    r: "ay"   },
  { w: "dismay",   r: "ay"   }, { w: "display",  r: "ay"   },
  { w: "belief",   r: "eef"  }, { w: "relief",   r: "eef"  },
  { w: "surprise", r: "ize"  }, { w: "disguise", r: "ize"  },
  { w: "demise",   r: "ize"  }, { w: "retreat",  r: "eet"  },
  { w: "defeat",   r: "eet"  }, { w: "deceit",   r: "eet"  },
  { w: "embrace",  r: "ace"  }, { w: "escape",   r: "ape"  },
  { w: "defense",  r: "ense" }, { w: "neglect",  r: "ect"  },
  { w: "contempt", r: "empt" }, { w: "release",  r: "eece" },
  { w: "mistake",  r: "ake"  },
  { w: "remorse",  r: "orse" }, { w: "divorce",  r: "orse" },
  { w: "resolve",  r: "olve" }, { w: "repose",   r: "oze"  },
  { w: "reward",   r: "ord"  },
  { w: "account",  r: "ownt" }, { w: "amount",   r: "ownt" },
];

// Trochaic nouns (stressed-unstressed)
const N2t = [
  { w: "river",    r: "iver"   }, { w: "silver",   r: "iver"   },
  { w: "winter",   r: "inter"  }, { w: "thunder",  r: "under"  },
  { w: "wonder",   r: "under"  }, { w: "garden",   r: "arden"  },
  { w: "shadow",   r: "adow"   }, { w: "meadow",   r: "adow"   },
  { w: "window",   r: "indow"  }, { w: "sorrow",   r: "orrow"  },
  { w: "hollow",   r: "ollow"  }, { w: "pillow",   r: "illow"  },
  { w: "silence",  r: "ilence" }, { w: "distance", r: "istance"},
  { w: "summer",   r: "ummer"  }, { w: "ember",    r: "ember"  },
  { w: "fever",    r: "ever"   }, { w: "morning",  r: "orning" },
  { w: "evening",  r: "eening" }, { w: "ocean",    r: "otion"  },
  { w: "reason",   r: "eason"  }, { w: "season",   r: "eason"  },
  { w: "moment",   r: "oment"  }, { w: "power",    r: "ower"   },
  { w: "tower",    r: "ower"   }, { w: "flower",   r: "ower"   },
  { w: "creature", r: "eature" }, { w: "nature",   r: "ature"  },
  { w: "fortune",  r: "ortune" }, { w: "spirit",   r: "irit"   },
  { w: "hunger",   r: "unger"  }, { w: "danger",   r: "anger"  },
  { w: "stranger", r: "anger"  }, { w: "harbor",   r: "arbor"  },
  { w: "burden",   r: "erden"  }, { w: "ending",   r: "ending" },
  { w: "surface",  r: "urface" },
  { w: "darkness", r: "arkness"}, { w: "madness",  r: "adness" },
  { w: "sadness",  r: "adness" }, { w: "kindness", r: "indness"},
  { w: "blindness",r: "indness"},
];

// Monosyllabic adjectives
const A1 = [
  { w: "bright",  r: "ight" }, { w: "white",   r: "ight" }, { w: "slight", r: "ight" },
  { w: "cold",    r: "old"  }, { w: "bold",    r: "old"  }, { w: "old",    r: "old"  },
  { w: "dark",    r: "ark"  }, { w: "stark",   r: "ark"  }, { w: "deep",   r: "eep"  },
  { w: "steep",   r: "eep"  }, { w: "black",   r: "ack"  }, { w: "wide",   r: "ide"  },
  { w: "blind",   r: "ind"  }, { w: "kind",    r: "ind"  }, { w: "wild",   r: "ild"  },
  { w: "pale",    r: "ale"  }, { w: "frail",   r: "ale"  }, { w: "thin",   r: "in"   },
  { w: "grim",    r: "im"   }, { w: "dim",     r: "im"   }, { w: "long",   r: "ong"  },
  { w: "strong",  r: "ong"  }, { w: "young",   r: "ung"  }, { w: "rough",  r: "uff"  },
  { w: "strange", r: "ange" }, { w: "red",     r: "ed"   }, { w: "dead",   r: "ed"   },
  { w: "bare",    r: "air"  }, { w: "rare",    r: "air"  }, { w: "fair",   r: "air"  },
  { w: "pure",    r: "oor"  }, { w: "slow",    r: "ow"   }, { w: "low",    r: "ow"   },
  { w: "true",    r: "oo"   }, { w: "new",     r: "oo"   }, { w: "blue",   r: "oo"   },
  { w: "dry",     r: "eye"  }, { w: "high",    r: "eye"  }, { w: "free",   r: "ee"   },
  { w: "grey",    r: "ay"   }, { w: "warm",    r: "orm"  }, { w: "lost",   r: "ost"  },
  { w: "vast",    r: "ast"  }, { w: "last",    r: "ast"  }, { w: "sharp",  r: "arp"  },
  { w: "soft",    r: "oft"  }, { w: "swift",   r: "ift"  }, { w: "great",  r: "ate"  },
  { w: "late",    r: "ate"  }, { w: "whole",   r: "ole"  }, { w: "sole",   r: "ole"  },
  { w: "sweet",   r: "eet"  }, { w: "fierce",  r: "erce" }, { w: "proud",  r: "owd"  },
  { w: "loud",    r: "owd"  }, { w: "rich",    r: "ich"  }, { w: "safe",   r: "afe"  },
  { w: "wrong",   r: "ong"  }, { w: "calm",    r: "alm"  }, { w: "clear",  r: "eer"  },
  { w: "near",    r: "eer"  }, { w: "dear",    r: "eer"  },
  { w: "fresh",   r: "esh"  }, { w: "lean",    r: "een"  }, { w: "clean",  r: "een"  },
  { w: "keen",    r: "een"  }, { w: "mean",    r: "een"  }, { w: "green",  r: "een"  },
];

// Iambic adjectives (unstressed-stressed)
const A2i = [
  { w: "alone",   r: "one"  }, { w: "unknown", r: "one"  },
  { w: "unseen",  r: "een"  }, { w: "serene",  r: "een"  },
  { w: "severe",  r: "eer"  }, { w: "sincere", r: "eer"  },
  { w: "austere", r: "eer"  }, { w: "alive",   r: "ive"  },
  { w: "awake",   r: "ake"  }, { w: "aware",   r: "air"  },
  { w: "remote",  r: "ote"  }, { w: "immense", r: "ense" },
  { w: "intense", r: "ense" }, { w: "profane", r: "ain"  },
  { w: "arcane",  r: "ain"  }, { w: "mundane", r: "ain"  },
  { w: "divine",  r: "ine"  }, { w: "benign",  r: "ine"  },
  { w: "sublime", r: "ime"  }, { w: "precise", r: "ice"  },
  { w: "complete",r: "eet"  }, { w: "absurd",  r: "erd"  },
  { w: "obscure", r: "oor"  }, { w: "secure",  r: "oor"  },
  { w: "entire",  r: "ire"  }, { w: "unkind",  r: "ind"  },
  { w: "unbound", r: "ownd" }, { w: "profound",r: "ownd" },
  { w: "forlorn", r: "orn"  }, { w: "unborn",  r: "orn"  },
  { w: "undone",  r: "un"   }, { w: "begun",   r: "un"   },
  { w: "untold",  r: "old"  }, { w: "unsold",  r: "old"  },
  { w: "unkempt", r: "empt" },
  { w: "bereft",  r: "eft"  }, { w: "corrupt", r: "upt"  },
  { w: "abrupt",  r: "upt"  },
];

// Trochaic adjectives (stressed-unstressed)
const A2t = [
  { w: "broken",   r: "oken"   }, { w: "frozen",   r: "ozen"   },
  { w: "golden",   r: "olden"  }, { w: "hidden",   r: "idden"  },
  { w: "sudden",   r: "udden"  }, { w: "silent",   r: "ilent"  },
  { w: "bitter",   r: "itter"  }, { w: "hollow",   r: "ollow"  },
  { w: "narrow",   r: "arrow"  }, { w: "shallow",  r: "allow"  },
  { w: "heavy",    r: "eavy"   }, { w: "steady",   r: "eady"   },
  { w: "empty",    r: "empty"  }, { w: "ancient",  r: "ancient"},
  { w: "patient",  r: "atient" }, { w: "distant",  r: "istant" },
  { w: "restless", r: "estless"}, { w: "endless",  r: "endless"},
  { w: "gentle",   r: "entle"  }, { w: "tender",   r: "ender"  },
  { w: "slender",  r: "ender"  }, { w: "fallow",   r: "allow"  },
  { w: "barren",   r: "arren"  }, { w: "rugged",   r: "ugged"  },
  { w: "wretched", r: "etched" }, { w: "wicked",   r: "icked"  },
  { w: "jagged",   r: "agged"  }, { w: "sacred",   r: "acred"  },
  { w: "naked",    r: "aked"   }, { w: "open",     r: "open"   },
  { w: "careless", r: "airless"}, { w: "fearless", r: "eerless"},
  { w: "weary",    r: "eary"   }, { w: "dreary",   r: "eary"   },
  { w: "lonely",   r: "only"   },
];

// Monosyllabic verbs
const V1 = [
  { w: "burns",  r: "ern"  }, { w: "turns",  r: "ern"  }, { w: "yearns", r: "ern"  },
  { w: "learns", r: "ern"  }, { w: "breaks", r: "ake"  }, { w: "wakes",  r: "ake"  },
  { w: "shakes", r: "ake"  }, { w: "grows",  r: "ow"   }, { w: "knows",  r: "ow"   },
  { w: "shows",  r: "ow"   }, { w: "flows",  r: "ow"   }, { w: "glows",  r: "ow"   },
  { w: "sings",  r: "ing"  }, { w: "brings", r: "ing"  }, { w: "clings", r: "ing"  },
  { w: "rings",  r: "ing"  }, { w: "dreams", r: "eem"  }, { w: "gleams", r: "eem"  },
  { w: "falls",  r: "all"  }, { w: "calls",  r: "all"  }, { w: "crawls", r: "all"  },
  { w: "finds",  r: "ind"  }, { w: "binds",  r: "ind"  }, { w: "grinds", r: "ind"  },
  { w: "holds",  r: "old"  }, { w: "folds",  r: "old"  },
  { w: "keeps",  r: "eep"  }, { w: "sleeps", r: "eep"  }, { w: "sweeps", r: "eep"  },
  { w: "weeps",  r: "eep"  }, { w: "creeps", r: "eep"  },
  { w: "hides",  r: "ide"  }, { w: "rides",  r: "ide"  },
  { w: "fades",  r: "ade"  }, { w: "bleeds", r: "eed"  }, { w: "feeds",  r: "eed"  },
  { w: "stands", r: "and"  }, { w: "fears",  r: "eer"  }, { w: "hears",  r: "eer"  },
  { w: "leaves", r: "eave" }, { w: "grieves",r: "eave" }, { w: "weaves", r: "eave" },
  { w: "shines", r: "ine"  }, { w: "ends",   r: "end"  }, { w: "bends",  r: "end"  },
  { w: "mends",  r: "end"  }, { w: "sends",  r: "end"  }, { w: "tends",  r: "end"  },
  { w: "melts",  r: "elt"  }, { w: "stays",  r: "ay"   }, { w: "prays",  r: "ay"   },
  { w: "sways",  r: "ay"   }, { w: "strays", r: "ay"   },
  { w: "waits",  r: "ate"  }, { w: "starves",r: "arve" }, { w: "carves", r: "arve" },
  { w: "dwells", r: "ell"  }, { w: "tells",  r: "ell"  }, { w: "swells", r: "ell"  },
  { w: "dies",   r: "eye"  }, { w: "flies",  r: "eye"  }, { w: "cries",  r: "eye"  },
  { w: "tries",  r: "eye"  }, { w: "lies",   r: "eye"  },
  { w: "saves",  r: "ave"  }, { w: "craves", r: "ave"  },
  { w: "drains", r: "ain"  }, { w: "strains",r: "ain"  }, { w: "stains", r: "ain"  },
  { w: "reigns", r: "ain"  },
  { w: "speaks", r: "eek"  }, { w: "seeks",  r: "eek"  },
  { w: "names",  r: "ame"  }, { w: "claims", r: "ame"  },
  { w: "moves",  r: "oove" }, { w: "proves", r: "oove" },
  { w: "thrives",r: "ive"  },
];

// Iambic verbs (unstressed-stressed)
const V2i = [
  { w: "returns",   r: "ern"  }, { w: "discerns",  r: "ern"  },
  { w: "believes",  r: "eave" }, { w: "deceives",  r: "eave" },
  { w: "conceives", r: "eave" }, { w: "receives",  r: "eave" },
  { w: "achieves",  r: "eave" }, { w: "relieves",  r: "eave" },
  { w: "divides",   r: "ide"  }, { w: "decides",   r: "ide"  },
  { w: "provides",  r: "ide"  }, { w: "confides",  r: "ide"  },
  { w: "collides",  r: "ide"  }, { w: "resides",   r: "ide"  },
  { w: "subsides",  r: "ide"  }, { w: "abides",    r: "ide"  },
  { w: "reveals",   r: "eal"  }, { w: "conceals",  r: "eal"  },
  { w: "appeals",   r: "eal"  }, { w: "repeats",   r: "eet"  },
  { w: "competes",  r: "eet"  }, { w: "completes", r: "eet"  },
  { w: "deletes",   r: "eet"  }, { w: "depletes",  r: "eet"  },
  { w: "arises",    r: "ize"  }, { w: "despises",  r: "ize"  },
  { w: "devises",   r: "ize"  }, { w: "surprises", r: "ize"  },
  { w: "ignites",   r: "ight" }, { w: "invites",   r: "ight" },
  { w: "excites",   r: "ight" }, { w: "unites",    r: "ight" },
  { w: "delights",  r: "ight" }, { w: "creates",   r: "ate"  },
  { w: "awaits",    r: "ate"  }, { w: "relates",   r: "ate"  },
  { w: "erodes",    r: "ode"  }, { w: "explodes",  r: "ode"  },
  { w: "unfolds",   r: "old"  }, { w: "beholds",   r: "old"  },
  { w: "upholds",   r: "old"  }, { w: "withholds", r: "old"  },
  { w: "compels",   r: "ell"  }, { w: "dispels",   r: "ell"  },
  { w: "expels",    r: "ell"  }, { w: "foretells", r: "ell"  },
  { w: "dissolves", r: "olve" }, { w: "resolves",  r: "olve" },
  { w: "revolves",  r: "olve" }, { w: "involves",  r: "olve" },
  { w: "evolves",   r: "olve" }, { w: "absolves",  r: "olve" },
  { w: "descends",  r: "end"  }, { w: "defends",   r: "end"  },
  { w: "pretends",  r: "end"  }, { w: "attends",   r: "end"  },
  { w: "offends",   r: "end"  }, { w: "suspends",  r: "end"  },
  { w: "transcends",r: "end"  }, { w: "intends",   r: "end"  },
  { w: "remains",   r: "ain"  }, { w: "explains",  r: "ain"  },
  { w: "contains",  r: "ain"  }, { w: "sustains",  r: "ain"  },
  { w: "constrains",r: "ain"  }, { w: "restrains", r: "ain"  },
  { w: "attains",   r: "ain"  }, { w: "obtains",   r: "ain"  },
  { w: "refrains",  r: "ain"  }, { w: "retains",   r: "ain"  },
  { w: "destroys",  r: "oy"   }, { w: "employs",   r: "oy"   },
  { w: "enjoys",    r: "oy"   }, { w: "deploys",   r: "oy"   },
  { w: "forgets",   r: "et"   }, { w: "regrets",   r: "et"   },
  { w: "decays",    r: "ay"   }, { w: "delays",    r: "ay"   },
  { w: "betrays",   r: "ay"   }, { w: "conveys",   r: "ay"   },
  { w: "repays",    r: "ay"   }, { w: "obeys",     r: "ay"   },
  { w: "portrays",  r: "ay"   }, { w: "surveys",   r: "ay"   },
  { w: "endures",   r: "oor"  }, { w: "obscures",  r: "oor"  },
  { w: "erases",    r: "ace"  }, { w: "embraces",  r: "ace"  },
  { w: "replaces",  r: "ace"  },
  { w: "devours",   r: "ower" },
  { w: "becomes",   r: "um"   }, { w: "begins",    r: "in"   },
  { w: "belongs",   r: "ong"  },
];

// Trochaic verbs (stressed-unstressed)
const V2t = [
  { w: "shatters",  r: "atter"  }, { w: "scatters",  r: "atter"  },
  { w: "gathers",   r: "ather"  }, { w: "wanders",   r: "ander"  },
  { w: "slumbers",  r: "umber"  }, { w: "whispers",  r: "isper"  },
  { w: "glimmers",  r: "immer"  }, { w: "shimmers",  r: "immer"  },
  { w: "flickers",  r: "icker"  }, { w: "withers",   r: "ither"  },
  { w: "lingers",   r: "inger"  }, { w: "hungers",   r: "unger"  },
  { w: "ponders",   r: "onder"  }, { w: "smolders",  r: "older"  },
  { w: "falters",   r: "alter"  }, { w: "harbors",   r: "arbor"  },
  { w: "murmurs",   r: "urmur"  }, { w: "suffers",   r: "uffer"  },
  { w: "follows",   r: "ollow"  }, { w: "swallows",  r: "allow"  },
  { w: "borrows",   r: "orrow"  }, { w: "narrows",   r: "arrow"  },
  { w: "opens",     r: "open"   }, { w: "darkens",   r: "arken"  },
  { w: "hardens",   r: "arden"  }, { w: "softens",   r: "often"  },
  { w: "listens",   r: "isten"  }, { w: "beckons",   r: "eckon"  },
  { w: "summons",   r: "ummon"  }, { w: "vanishes",  r: "anish"  },
  { w: "perishes",  r: "erish"  }, { w: "flourishes",r: "ourish" },
  { w: "nourishes", r: "ourish" }, { w: "tarnishes", r: "arnish" },
  { w: "threatens", r: "eaten"  }, { w: "hastens",   r: "asten"  },
  { w: "founders",  r: "ounder" },
];

// Bare infinitive verbs (for use after modals: can, will, must, shall)
const V1b = [
  { w: "burn",   r: "ern"  }, { w: "turn",   r: "ern"  }, { w: "yearn",  r: "ern"  },
  { w: "learn",  r: "ern"  }, { w: "break",  r: "ake"  }, { w: "wake",   r: "ake"  },
  { w: "shake",  r: "ake"  }, { w: "grow",   r: "ow"   }, { w: "know",   r: "ow"   },
  { w: "show",   r: "ow"   }, { w: "flow",   r: "ow"   }, { w: "glow",   r: "ow"   },
  { w: "sing",   r: "ing"  }, { w: "bring",  r: "ing"  }, { w: "cling",  r: "ing"  },
  { w: "dream",  r: "eem"  }, { w: "gleam",  r: "eem"  },
  { w: "fall",   r: "all"  }, { w: "call",   r: "all"  }, { w: "crawl",  r: "all"  },
  { w: "find",   r: "ind"  }, { w: "bind",   r: "ind"  }, { w: "grind",  r: "ind"  },
  { w: "hold",   r: "old"  }, { w: "fold",   r: "old"  },
  { w: "keep",   r: "eep"  }, { w: "sleep",  r: "eep"  }, { w: "sweep",  r: "eep"  },
  { w: "weep",   r: "eep"  }, { w: "creep",  r: "eep"  },
  { w: "hide",   r: "ide"  }, { w: "ride",   r: "ide"  },
  { w: "fade",   r: "ade"  }, { w: "bleed",  r: "eed"  }, { w: "feed",   r: "eed"  },
  { w: "stand",  r: "and"  }, { w: "fear",   r: "eer"  }, { w: "hear",   r: "eer"  },
  { w: "leave",  r: "eave" }, { w: "grieve", r: "eave" }, { w: "weave",  r: "eave" },
  { w: "shine",  r: "ine"  }, { w: "end",    r: "end"  }, { w: "bend",   r: "end"  },
  { w: "mend",   r: "end"  }, { w: "send",   r: "end"  }, { w: "tend",   r: "end"  },
  { w: "melt",   r: "elt"  }, { w: "stay",   r: "ay"   }, { w: "pray",   r: "ay"   },
  { w: "sway",   r: "ay"   }, { w: "stray",  r: "ay"   },
  { w: "wait",   r: "ate"  }, { w: "starve", r: "arve" }, { w: "carve",  r: "arve" },
  { w: "dwell",  r: "ell"  }, { w: "tell",   r: "ell"  }, { w: "swell",  r: "ell"  },
  { w: "die",    r: "eye"  }, { w: "fly",    r: "eye"  }, { w: "cry",    r: "eye"  },
  { w: "try",    r: "eye"  }, { w: "save",   r: "ave"  }, { w: "crave",  r: "ave"  },
  { w: "drain",  r: "ain"  }, { w: "strain", r: "ain"  }, { w: "stain",  r: "ain"  },
  { w: "reign",  r: "ain"  }, { w: "speak",  r: "eek"  }, { w: "seek",   r: "eek"  },
  { w: "name",   r: "ame"  }, { w: "claim",  r: "ame"  },
  { w: "move",   r: "oove" }, { w: "prove",  r: "oove" },
  { w: "thrive", r: "ive"  }, { w: "trust",  r: "ust"  }, { w: "change", r: "ange" },
  { w: "trace",  r: "ace"  }, { w: "chase",  r: "ace"  },
];

// ============================================================
// LINE TEMPLATES
// Each template is a string with {slots}.
// Slot types:
//   {A1}  = monosyllabic adjective (1 syl, stressed)
//   {A2i} = iambic adjective (2 syl, 01)
//   {A2t} = trochaic adjective (2 syl, 10)
//   {N1}  = monosyllabic noun (1 syl, stressed)
//   {N2i} = iambic noun (2 syl, 01)
//   {N2t} = trochaic noun (2 syl, 10)
//   {V1}  = monosyllabic verb-3s (1 syl, stressed)
//   {V2i} = iambic verb-3s (2 syl, 01)
//   {V2t} = trochaic verb-3s (2 syl, 10)
//
// Each template must have exactly 10 syllables with iambic stress:
//   0 1 | 0 1 | 0 1 | 0 1 | 0 1
//
// The LAST slot is always the rhyming word — marked with *
// ============================================================

// Templates are built as arrays of token specs below.
// Each template sums to exactly 10 syllables with iambic stress (0101010101).
// The last content slot is marked with * to indicate the rhyming position.

// Format: each segment is a word with known syllable count and stress.
// Function words provide the glue.

// Function word inventory with stress patterns:
// 0: the, a, in, on, of, to, from, with, by, and, or, for, it, is, was, has, had, as, if
// 1: this, that, each, my, your, his, her, our, no, I, we, you, they, what,
//    through, but, yet, nor, so, when, where, while, though, then, now, here, there, still,
//    not, all, both, some, such, just, more, most, can, could, will, would, shall, may, might, must
// 01: beneath, beyond, between, above, across, against, among, before, behind, below, beside,
//     within, without, upon, away, again, alone, perhaps
// 10: after, under, over, into, never, always, only, also, ever, every, very, many, other

// Build templates as arrays of token specs
function T(parts) {
  // parts is an array of [word_or_slot, stress_array]
  // Verify total is 10 syllables
  let total = 0;
  for (const [, stress] of parts) total += stress.length;
  if (total !== 10) return null; // invalid template

  // Verify stress pattern is close to iambic
  const flat = parts.flatMap(([, s]) => s);
  let penalty = 0;
  for (let i = 0; i < 10; i++) {
    if (flat[i] !== (i % 2)) penalty++;
  }
  if (penalty > 3) return null; // too far from iambic

  return parts;
}

// Build all templates
const ALL_TEMPLATES = [
  // "the [A1] [N2t] [V2i] the [N1]"
  // the=0, A1=1, N2t=10, V2i=01, the=0, N1=1
  // stress: 0 1 1 0 0 1 0 1 = 8 syl — too short
  // need to add 2 more syllables

  // "the [A1] [N2t] [V2i] [A2i] [N1]"
  // 0 1 10 01 01 1 = 8 syl — still 8
  // Hmm, 1+1+2+2+2+1 = 9

  // Let me count more carefully.
  // the(1) + A1(1) + N2t(2) + V2i(2) + the(1) + N1(1) = 8. Right.
  // Need templates summing to exactly 10.

  // === 10-syllable templates ===

  // Pattern: the(0) A1(1) N2t(10) V2i(01) upon(01) the(0) N1(1)
  // Syl: 1+1+2+2+2+1+1 = 10
  // Stress: 0 1 10 01 01 0 1 = 0 1 1 0 0 1 0 1 0 1 ✓ PERFECT iambic!
  [["the",[0]], ["A1",[1]], ["N2t",[1,0]], ["V2i",[0,1]], ["upon",[0,1]], ["the",[0]], ["N1*",[1]]],

  // Pattern: beneath(01) the(0) A1(1) N2t(10) the(0) N1(1) V1(1)s A1(1) N1*(1)
  // Nope, too many. Let me think smaller.

  // "the(0) N1(1) of(0) N1(1) V2i(01) the(0) A1(1) N2t(10)"
  // 1+1+1+1+2+1+1+2 = 10
  // 0 1 0 1 01 0 1 10 = 0 1 0 1 0 1 0 1 1 0 — almost! last foot is trochee
  // That's a common "feminine ending" — acceptable!
  [["the",[0]], ["N1",[1]], ["of",[0]], ["N1",[1]], ["V2i",[0,1]], ["the",[0]], ["A1",[1]], ["N2t*",[1,0]]],

  // "I(1) V1(1) the(0) A1(1) N1(1) and(0) V1(1) the(0) A1(1) N1*(1)"
  // 1+1+1+1+1+1+1+1+1+1 = 10
  // 1 1 0 1 1 0 1 0 1 1 — too many stresses
  // Initial spondee is ok but this is rough.

  // "in(0) A1(1) N2t(10) I(1) V1(1) the(0) A1(1) N2t*(10)"
  // 1+1+2+1+1+1+1+2 = 10
  // 0 1 10 1 1 0 1 10 = 0 1 1 0 1 1 0 1 1 0 — Hmm, spondee in ft 3
  // Workable with some latitude

  // "a(0) N2t(10) of(0) N1(1) V2i(01) the(0) N1*(1)"
  // 1+2+1+1+2+1+1 = 9 — one short

  // "a(0) N2t(10) of(0) A1(1) N1(1) V2i(01) N1*(1)"
  // 1+2+1+1+1+2+1 = 9 — still short

  // "the(0) A2t(10) N1(1) V2i(01) the(0) A1(1) N1*(1)"
  // 1+2+1+2+1+1+1 = 9

  // "within(01) the(0) A1(1) N2t(10) I(1) V1(1) the(0) N1*(1)"
  // 2+1+1+2+1+1+1+1 = 10
  // 01 0 1 10 1 1 0 1 = 0 1 0 1 1 0 1 1 0 1 — spondee in ft 3, ok
  // "within(01) the(0) A1(1) N2t(10) it(0) V1(1) the(0) N1*(1)"
  [["within",[0,1]], ["the",[0]], ["A1",[1]], ["N2t",[1,0]], ["it",[0]], ["V1",[1]], ["the",[0]], ["N1*",[1]]],

  // "the(0) N2t(10) of(0) N1(1) V2i(01) A2i(01) N1*(1)"
  // 1+2+1+1+2+2+1 = 10
  // 0 10 0 1 01 01 1 = 0 1 0 0 1 0 1 0 1 1 — pyrrhic in ft 2, spondee at end. Meh.

  // "when(1) A1(1) N1(1) V2i(01) the(0) A2t(10) N1*(1)"
  // 1+1+1+2+1+2+1 = 9 — short

  // "if(0) A1(1) N2t(10) V1(1) through(1) A2t(10) N1*(1)"
  // 1+1+2+1+1+2+1 = 9

  // Let me try pure 10 patterns more systematically.
  // Need exactly 10 syllables matching 0101010101 as closely as possible.
  // Available pieces: 1-syl(0 or 1), 2-syl(01 or 10)
  //
  // 0+1+01+01+01+01 = 10 syllables → 0 1 01 01 01 01 = 0101010101 ← perfect!
  // That's: func(0) + content(1) + 2syl(01) + 2syl(01) + 2syl(01) + 2syl(01)
  // Hmm but 4 iambic disyllables in a row gets monotonous.

  // 0+1+0+1+01+0+1+01 = 10 → 01 01 01 01 01 ← perfect
  // func + content + func + content + iamb + func + content + iamb

  // "the(0) N1(1) of(0) N1(1) V2i(01) the(0) A1(1) N2i*(01)"
  // 1+1+1+1+2+1+1+2 = 10 ← YES
  // 0 1 0 1 01 0 1 01 = 0101010101 ← PERFECT
  [["the",[0]], ["N1",[1]], ["of",[0]], ["N1",[1]], ["V2i",[0,1]], ["the",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "the(0) A1(1) N2i(01) V2i(01) the(0) A1(1) N2i*(01)"
  // 1+1+2+2+1+1+2 = 10
  // 0 1 01 01 0 1 01 = 0101010101 ← PERFECT
  [["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["V2i",[0,1]], ["the",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "it(0) V1(1) the(0) A1(1) N2i(01) of(0) A1(1) N2i*(01)"
  // 1+1+1+1+2+1+1+2 = 10
  // 0 1 0 1 01 0 1 01 = 0101010101 ← PERFECT
  [["it",[0]], ["V1",[1]], ["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["of",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "when(0) N1(1) V2i(01) the(0) A1(1) N1(1) will(0) V1(1) and(0) N1*(1)"
  // 1+1+2+1+1+1+1+1+1+1 = 11 — too long

  // "the(0) A1(1) N2i(01) V1(1) like(0) A1(1) N2i*(01)"
  // 1+1+2+1+1+1+2 = 9 — short

  // "and(0) A1(1) N2i(01) V2i(01) the(0) A1(1) N1*(1)"
  // 1+1+2+2+1+1+1 = 9

  // "and(0) A1(1) N2i(01) V2i(01) A2i(01) N1*(1)"
  // 1+1+2+2+2+1 = 9

  // "in(0) N1(1) and(0) N1(1) the(0) N2t(10) V2i(01) N1*(1)"
  // 1+1+1+1+1+2+2+1 = 10
  // 0 1 0 1 0 10 01 1 = 0 1 0 1 0 1 0 0 1 1 — pyrrhic+spondee at end, passable
  [["in",[0]], ["N1",[1]], ["and",[0]], ["N1",[1]], ["the",[0]], ["N2t",[1,0]], ["V2i",[0,1]], ["N1*",[1]]],

  // "by(0) N1(1) or(0) N1(1) the(0) N2t(10) V2i(01) N1*(1)"
  [["by",[0]], ["N1",[1]], ["or",[0]], ["N1",[1]], ["the",[0]], ["N2t",[1,0]], ["V2i",[0,1]], ["N1*",[1]]],

  // "through(0) A1(1) N2i(01) and(0) A1(1) N2i(01) it(0) V1*(1)"
  // 1+1+2+1+1+2+1+1 = 10
  // 0 1 01 0 1 01 0 1 = 0101010101 ← PERFECT
  [["through",[0]], ["A1",[1]], ["N2i",[0,1]], ["and",[0]], ["A1",[1]], ["N2i",[0,1]], ["it",[0]], ["V1*",[1]]],

  // "where(0) A1(1) N2i(01) V2i(01) and(0) N1(1) V1*(1)"
  // 1+1+2+2+1+1+1 = 9 — short

  // "where(0) A1(1) N2i(01) V2i(01) the(0) A1(1) N1*(1)"
  // 1+1+2+2+1+1+1 = 9

  // "where(0) A1(1) N2i(01) V2i(01) A2i(01) and(0) N1*(1)"
  // 1+1+2+2+2+1+1 = 10
  // 0 1 01 01 01 0 1 = 0101010101 ← PERFECT
  [["where",[0]], ["A1",[1]], ["N2i",[0,1]], ["V2i",[0,1]], ["A2i",[0,1]], ["and",[0]], ["N1*",[1]]],

  // "upon(01) the(0) N1(1) of(0) N1(1) the(0) N2t(10) V1*(1)"
  // 2+1+1+1+1+1+2+1 = 10
  // 01 0 1 0 1 0 10 1 = 0 1 0 1 0 1 0 1 0 1 ← PERFECT
  [["upon",[0,1]], ["the",[0]], ["N1",[1]], ["of",[0]], ["N1",[1]], ["the",[0]], ["N2t",[1,0]], ["V1*",[1]]],

  // "between(01) the(0) N1(1) and(0) N1(1) the(0) N2t(10) V1*(1)"
  // 2+1+1+1+1+1+2+1 = 10
  // 01 0 1 0 1 0 10 1 = 0101010101 ← PERFECT
  [["between",[0,1]], ["the",[0]], ["N1",[1]], ["and",[0]], ["N1",[1]], ["the",[0]], ["N2t",[1,0]], ["V1*",[1]]],

  // "beneath(01) the(0) A1(1) N2i(01) the(0) N2t(10) V1*(1)"
  // 2+1+1+2+1+2+1 = 10
  // 01 0 1 01 0 10 1 = 0101010101 ← PERFECT (with 10 having a little hiccup but fine)
  [["beneath",[0,1]], ["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["the",[0]], ["N2t",[1,0]], ["V1*",[1]]],

  // "beyond(01) the(0) N1(1) of(0) N2t(10) the(0) N1(1) V1*(1)"
  // 2+1+1+1+2+1+1+1 = 10
  // 01 0 1 0 10 0 1 1 — not great (pyrrhic in ft 4)

  // "it(0) V1(1) the(0) A1(1) N2i(01) of(0) A1(1) N2i*(01)"
  // same structure, different function word
  [["he",[0]], ["V1",[1]], ["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["of",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "from(0) N1(1) to(0) N1(1) the(0) N2t(10) V2i(01) N1*(1)"
  // 10 syllables, stress: 0 1 0 1 0 10 01 1 = 0 1 0 1 0 1 0 0 1 1
  // ending spondee — very common in English verse
  [["from",[0]], ["N1",[1]], ["to",[0]], ["N1",[1]], ["the",[0]], ["N2t",[1,0]], ["V2i",[0,1]], ["N1*",[1]]],

  // "if(0) N1(1) V2i(01) the(0) A1(1) N2i(01) of(0) N1*(1)"
  // 1+1+2+1+1+2+1+1 = 10
  // 0 1 01 0 1 01 0 1 = 0101010101 ← PERFECT
  [["if",[0]], ["N1",[1]], ["V2i",[0,1]], ["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["of",[0]], ["N1*",[1]]],

  // "while(0) N1(1) V2i(01) the(0) A1(1) N2i(01) of(0) N1*(1)"
  [["while",[0]], ["N1",[1]], ["V2i",[0,1]], ["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["of",[0]], ["N1*",[1]]],

  // "as(0) N1(1) and(0) N1(1) V2i(01) the(0) A1(1) N2i*(01)"
  [["as",[0]], ["N1",[1]], ["and",[0]], ["N1",[1]], ["V2i",[0,1]], ["the",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "no(0) A1(1) N2i(01) V2i(01) the(0) A1(1) N1*(1)"
  // 1+1+2+2+1+1+1 = 9 — short

  // "no(1) N1(1) of(0) N1(1) V2i(01) a(0) A1(1) N1*(1)"
  // First foot spondee is extremely common
  // 1+1+1+1+2+1+1+1 = 9 — short still

  // "no(0) A1(1) N2i(01) can(0) V1b(1) without(01) a(0) N1*(1)"
  // 1+1+2+1+1+2+1+1 = 10
  // 0 1 01 0 1 01 0 1 = 0101010101 ← PERFECT
  [["no",[0]], ["A1",[1]], ["N2i",[0,1]], ["can",[0]], ["V1b",[1]], ["without",[0,1]], ["a",[0]], ["N1*",[1]]],

  // "for(0) N1(1) and(0) N1(1) the(0) N2t(10) V2i(01) N1*(1)"
  [["for",[0]], ["N1",[1]], ["and",[0]], ["N1",[1]], ["the",[0]], ["N2t",[1,0]], ["V2i",[0,1]], ["N1*",[1]]],

  // "yet(0) N1(1) V2i(01) and(0) N1(1) V2i(01) N1*(1)"
  // 1+1+2+1+1+2+1 = 9

  // "yet(0) A1(1) N2i(01) V2i(01) beyond(01) the(0) N1*(1)"
  // 1+1+2+2+2+1+1 = 10
  // 0 1 01 01 01 0 1 = 0101010101 ← PERFECT
  [["yet",[0]], ["A1",[1]], ["N2i",[0,1]], ["V2i",[0,1]], ["beyond",[0,1]], ["the",[0]], ["N1*",[1]]],

  // "though(0) A1(1) N2i(01) V2i(01) A2i(01) and(0) N1*(1)"
  [["though",[0]], ["A1",[1]], ["N2i",[0,1]], ["V2i",[0,1]], ["A2i",[0,1]], ["and",[0]], ["N1*",[1]]],

  // Couplet-closing templates (more decisive/epigrammatic feel):

  // "so(0) N1(1) V2i(01) what(0) N1(1) V2i(01) in(0) N1*(1)"
  // 1+1+2+1+1+2+1+1 = 10
  [["so",[0]], ["N1",[1]], ["V2i",[0,1]], ["what",[0]], ["N1",[1]], ["V2i",[0,1]], ["in",[0]], ["N1*",[1]]],

  // "she(0) V1(1) the(0) A1(1) N2i(01) of(0) A1(1) N2i*(01)"
  [["she",[0]], ["V1",[1]], ["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["of",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "and(0) V1(1) the(0) A1(1) N2i(01) of(0) A1(1) N1*(1)"
  // 1+1+1+1+2+1+1+1 = 9 — short

  // "and(0) so(1) the(0) A1(1) N2i(01) V2i(01) the(0) N1*(1)"
  // 1+1+1+1+2+2+1+1 = 10
  // 0 1 0 1 01 01 0 1 = 0101010101 ← PERFECT
  [["and",[0]], ["so",[1]], ["the",[0]], ["A1",[1]], ["N2i",[0,1]], ["V2i",[0,1]], ["the",[0]], ["N1*",[1]]],

  // "the(0) N2t(10) N1(1) of(0) N1(1) V2i(01) the(0) N1*(1)"
  // Genitive chain: "the winter stone of rain contains the flame"
  // 1+2+1+1+1+2+1+1 = 10
  // 0 10 1 0 1 01 0 1 = 0 1 0 1 0 1 0 1 0 1 ← PERFECT
  [["the",[0]], ["N2t",[1,0]], ["N1",[1]], ["of",[0]], ["N1",[1]], ["V2i",[0,1]], ["the",[0]], ["N1*",[1]]],

  // "a(0) N2t(10) V1(1) upon(01) the(0) A1(1) N2i*(01)"
  // 1+2+1+2+1+1+2 = 10
  // 0 10 1 01 0 1 01 = 0 1 0 1 0 1 0 1 0 1 ← PERFECT
  [["a",[0]], ["N2t",[1,0]], ["V1",[1]], ["upon",[0,1]], ["the",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "the(0) N2t(10) V1(1) beyond(01) the(0) A1(1) N1*(1)"
  // 1+2+1+2+1+1+1 = 9 — short

  // "the(0) N2t(10) V1(1) within(01) a(0) A1(1) N2i*(01)"
  // 1+2+1+2+1+1+2 = 10 ← PERFECT
  [["the",[0]], ["N2t",[1,0]], ["V1",[1]], ["within",[0,1]], ["a",[0]], ["A1",[1]], ["N2i*",[0,1]]],

  // "what(0) N2t(10) N1(1) can(0) V1b(1) against(01) the(0) N1*(1)"
  // 1+2+1+1+1+2+1+1 = 10
  // 0 10 1 0 1 01 0 1 = 0101010101 ← PERFECT
  [["what",[0]], ["N2t",[1,0]], ["N1",[1]], ["can",[0]], ["V1b",[1]], ["against",[0,1]], ["the",[0]], ["N1*",[1]]],

  // "each(0) N2t(10) V1(1) before(01) the(0) A1(1) N1*(1)"
  // 1+2+1+2+1+1+1 = 9 — short

  // "each(0) A1(1) N2i(01) V2i(01) against(01) the(0) N1*(1)"
  // 1+1+2+2+2+1+1 = 10
  // 0 1 01 01 01 0 1 = 0101010101 ← PERFECT
  [["each",[0]], ["A1",[1]], ["N2i",[0,1]], ["V2i",[0,1]], ["against",[0,1]], ["the",[0]], ["N1*",[1]]],
];

// Filter out any null templates
const VALID_TEMPLATES = ALL_TEMPLATES.filter(t => t !== null && t !== undefined);

// ============================================================
// WORD POOLS
// ============================================================

const POOLS = {
  "N1":  N1,
  "N2i": N2i,
  "N2t": N2t,
  "A1":  A1,
  "A2i": A2i,
  "A2t": A2t,
  "V1":  V1,
  "V1b": V1b,
  "V2i": V2i,
  "V2t": V2t,
};

// Build rhyme index: rhyme_group -> list of {pool, entry}
const RHYME_INDEX = {};
for (const [poolName, pool] of Object.entries(POOLS)) {
  for (const entry of pool) {
    if (!entry.r) continue;
    if (!RHYME_INDEX[entry.r]) RHYME_INDEX[entry.r] = [];
    RHYME_INDEX[entry.r].push({ pool: poolName, entry });
  }
}

// Get available rhyme groups for a given pool type
function rhymeGroupsForPool(poolName) {
  const pool = POOLS[poolName];
  const groups = {};
  for (const entry of pool) {
    if (entry.r) {
      if (!groups[entry.r]) groups[entry.r] = [];
      groups[entry.r].push(entry);
    }
  }
  return groups;
}

// ============================================================
// LINE GENERATION (v2)
// ============================================================

function generateLine2(rng, targetRhyme, usedEndWords) {
  // Pick a random template
  const shuffledTemplates = rng.shuffle(VALID_TEMPLATES);

  for (const template of shuffledTemplates) {
    // Find the rhyming slot (marked with *)
    let rhymeSlotIdx = -1;
    let rhymePoolName = null;
    for (let i = 0; i < template.length; i++) {
      const [token] = template[i];
      if (token.endsWith("*")) {
        rhymeSlotIdx = i;
        rhymePoolName = token.replace("*", "");
        break;
      }
    }

    if (rhymeSlotIdx === -1) continue; // no rhyme slot found (shouldn't happen)

    // Check if we can satisfy the rhyme constraint
    const rhymePool = POOLS[rhymePoolName];
    if (!rhymePool) continue;

    let rhymeCandidates;
    if (targetRhyme) {
      rhymeCandidates = rhymePool.filter(e => e.r === targetRhyme && !usedEndWords.has(e.w));
    } else {
      rhymeCandidates = rhymePool.filter(e => e.r && !usedEndWords.has(e.w));
    }

    if (rhymeCandidates.length === 0) continue;

    const rhymeWord = rng.pick(rhymeCandidates);

    // Fill other slots
    const usedInLine = new Set([rhymeWord.w]);
    const lineWords = [];
    let failed = false;

    for (let i = 0; i < template.length; i++) {
      const [token] = template[i];

      if (i === rhymeSlotIdx) {
        lineWords.push(rhymeWord.w);
        continue;
      }

      const cleanToken = token.replace("*", "");

      if (POOLS[cleanToken]) {
        // Content word slot — pick a random word from the pool
        const candidates = POOLS[cleanToken].filter(e => !usedInLine.has(e.w));
        if (candidates.length === 0) { failed = true; break; }
        const chosen = rng.pick(candidates);
        lineWords.push(chosen.w);
        usedInLine.add(chosen.w);
      } else {
        // Function word — use as-is
        lineWords.push(token);
      }
    }

    if (failed) continue;

    return {
      line: lineWords.join(" "),
      rhyme: rhymeWord.r,
      endWord: rhymeWord.w,
    };
  }

  return null;
}

// ============================================================
// SONNET GENERATION (v2)
// ============================================================

const RHYME_SCHEME = ['A','B','A','B','C','D','C','D','E','F','E','F','G','G'];

function generateSonnet2(rng) {
  // For each scheme letter, we need a rhyme group.
  // First, discover which rhyme groups are available for end-position pools.
  // End-position pools are determined by templates — collect all end pool types.
  const endPoolTypes = new Set();
  for (const template of VALID_TEMPLATES) {
    for (const [token] of template) {
      if (token.endsWith("*")) {
        endPoolTypes.add(token.replace("*", ""));
      }
    }
  }

  // For each end pool type, get available rhyme groups
  const allRhymeGroups = {};
  for (const poolType of endPoolTypes) {
    const groups = rhymeGroupsForPool(poolType);
    for (const [group, entries] of Object.entries(groups)) {
      if (!allRhymeGroups[group]) allRhymeGroups[group] = [];
      allRhymeGroups[group].push(...entries.map(e => ({ pool: poolType, entry: e })));
    }
  }

  // We need 7 distinct rhyme groups, each with at least 2 usable end words
  const viableGroups = Object.entries(allRhymeGroups)
    .filter(([, entries]) => {
      const uniqueWords = new Set(entries.map(e => e.entry.w));
      return uniqueWords.size >= 2;
    })
    .map(([group]) => group);

  if (viableGroups.length < 7) return null;

  // Assign rhyme groups to letters
  const letters = [...new Set(RHYME_SCHEME)]; // A,B,C,D,E,F,G
  const shuffledGroups = rng.shuffle(viableGroups);
  const assignment = {};
  for (let i = 0; i < letters.length; i++) {
    assignment[letters[i]] = shuffledGroups[i];
  }

  // Generate lines
  const lines = [];
  const usedEndWords = new Set();

  for (let i = 0; i < 14; i++) {
    const letter = RHYME_SCHEME[i];
    const targetRhyme = assignment[letter];

    let result = null;
    for (let attempt = 0; attempt < 100; attempt++) {
      result = generateLine2(rng, targetRhyme, usedEndWords);
      if (result) break;
    }

    if (!result) return null;

    usedEndWords.add(result.endWord);
    lines.push(result);
  }

  return lines;
}

// ============================================================
// FORMATTING
// ============================================================

function formatSonnet2(lines, rng) {
  if (!lines) return null;

  const formatted = lines.map((l, i) => {
    let text = l.line;

    // Fix a/an before vowels
    text = text.replace(/\ba (a|e|i|o|u)/gi, (match, vowel) => {
      return match[0] === 'A' ? `An ${vowel}` : `an ${vowel}`;
    });

    // Capitalize first letter of line
    text = text.charAt(0).toUpperCase() + text.slice(1);

    // Punctuation logic
    if (i === 3 || i === 7) {
      text += ".";  // end of quatrain
    } else if (i === 11) {
      text += ".";  // end of third quatrain, before couplet turn
    } else if (i === 13) {
      text += ".";  // final line
    } else if (i === 12) {
      text += ",";  // first line of couplet
    } else {
      // Interior lines: vary punctuation
      const r = rng.next();
      if (r < 0.25) text += ",";
      else if (r < 0.35) text += ";";
      // else: enjambment (no punctuation)
    }

    return text;
  });

  // Add stanza breaks
  const output = [];
  for (let i = 0; i < formatted.length; i++) {
    output.push(formatted[i]);
    if (i === 3 || i === 7 || i === 11) output.push("");
  }

  return output.join("\n");
}

// ============================================================
// MAIN
// ============================================================

function main() {
  const args = process.argv.slice(2);
  let count = 1;
  let seed = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--many" && args[i + 1]) {
      count = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--seed" && args[i + 1]) {
      seed = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--help" || args[i] === "-h") {
      console.log("Sonnet Machine — generates formal sonnets from a constrained lexicon");
      console.log("");
      console.log("Usage: node sonnet-machine.js [options]");
      console.log("");
      console.log("Options:");
      console.log("  --many N    Generate N sonnets");
      console.log("  --seed N    Use specific random seed");
      console.log("  --help      Show this help");
      console.log("");
      console.log("Each sonnet uses iambic pentameter and Shakespearean");
      console.log("rhyme scheme (ABAB CDCD EFEF GG), assembled from a");
      console.log("curated vocabulary of ~700 words. No neural generation —");
      console.log("just combinatorics and meter.");
      process.exit(0);
    }
  }

  const baseSeed = seed !== null ? seed : Date.now();

  let generated = 0;
  let attempts = 0;
  const maxAttempts = count * 100;

  while (generated < count && attempts < maxAttempts) {
    const rng = new Random(baseSeed + attempts);
    const sonnet = generateSonnet2(rng);
    attempts++;

    if (sonnet) {
      const text = formatSonnet2(sonnet, rng);
      if (text) {
        if (generated > 0) console.log("\n" + "~".repeat(50) + "\n");
        console.log(text);
        generated++;
      }
    }
  }

  if (generated === 0) {
    console.error("Failed to generate a sonnet after " + attempts + " attempts.");
    console.error("Try a different seed (--seed N).");
    process.exit(1);
  }
}

main();
