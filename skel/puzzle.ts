import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input: string, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

async function* part2(input: string, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

function parseInput(input: string) {
  return input.trimEnd();
}

export default { part1, part2 };
