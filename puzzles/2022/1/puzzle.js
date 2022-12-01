import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const elfs = parseInput(input);

  const mostCalories = Math.max(...elfs.map(sum));

  return mostCalories;
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  const elfs = parsed.map(sum).sort((a, b) => b - a);

  return sum(elfs.slice(0, 3));
}

function parseInput(input) {
  return input.trim().split('\n\n').map(elf => elf.split('\n').map(x => +x));
}

export default { part1, part2 };
