import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { createHash } from 'crypto';

async function part1(input) {
  const key = parseInput(input);

  // I love a good excuse to do all the work in the for clause of a for loop
  let suffix;
  for(
    suffix = 0;
    !createHash('md5').update(key + suffix).digest('hex').startsWith('00000');
    ++suffix
  ) {}

  return suffix;
}

async function part2(input) {
  const key = parseInput(input);

  // I love a good excuse to do all the work in the for clause of a for loop
  let suffix;
  for(
    suffix = 0;
    !createHash('md5').update(key + suffix).digest('hex').startsWith('000000');
    ++suffix
  ) {}

  return suffix;
}

function parseInput(input) {
  return input.trim();
}

export default { part1, part2 };
