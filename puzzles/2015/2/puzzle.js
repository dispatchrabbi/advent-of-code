import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { sum } from '#utils/maths';

async function part1(input) {
  const presents = parseInput(input);

  return sum(presents.map(calculateWrappingPaperNeeded));
}

async function part2(input) {
  const presents = parseInput(input);

  return sum(presents.map(calculateRibbonNeeded));
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split('x').map(x => +x));
}

function calculateWrappingPaperNeeded(dimensions) {
  const [ l, w, h ] = dimensions.sort((a, b) => a - b);

  return (3 * l * w) + (2 * w * h) + (2 * l * h);
}

function calculateRibbonNeeded(dimensions) {
  const [ l, w, h ] = dimensions.sort((a, b) => a - b);

  return (l + w + l + w) + (l * w * h);
}

export default { part1, part2 };
