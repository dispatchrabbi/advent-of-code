import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

function parseInput(input) {
  return input.trim();
}

export default { part1, part2 };
