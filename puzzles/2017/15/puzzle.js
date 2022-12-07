import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const seeds = parseInput(input);

  const score = duel(
    duelingGenerator(seeds[0], 16807), // factors are given by the puzzle text
    duelingGenerator(seeds[1], 48271)
  );

  return score;
}

async function* part2(input, options = {}) {
  const seeds = parseInput(input);

  const score = duel(
    pickyDuelingGenerator(seeds[0], 16807, 4), // factors are given by the puzzle text
    pickyDuelingGenerator(seeds[1], 48271, 8)
  );

  return score;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => +/\d+/.exec(line));
}

function* duelingGenerator(seed, factor) {
  let val = seed;
  while(true) {
    val = (val * factor) % 2147483647;
    yield val;
  }
}

function* pickyDuelingGenerator(seed, factor, mod) {
  const inner = duelingGenerator(seed, factor);
  let val;
  while(true) {
    val = inner.next().value;
    while(val % mod !== 0) {
      val = inner.next().value;
    }

    yield val;
  }
}

function duel(a, b) {
  let score = 0;
  for(let i = 0; i < 5000000; ++i) {
    score += ((a.next().value & 0xffff) === (b.next().value & 0xffff)) ? 1 : 0;
  }
  return score;
}

export default { part1, part2 };
