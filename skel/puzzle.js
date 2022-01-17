import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

async function part1(input, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

async function part2(input) {
  const parsed = parseInput(input);

  return parsed;
}

function parseInput(input, options = {}) {
  return input.trim();
}

export default { part1, part2 };
