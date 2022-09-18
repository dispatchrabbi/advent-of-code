import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const parsed = parseInput(input);
  return sum(filterElementsThatMatchTheNextElement(parsed).map(x => +x));
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);
  return sum(filterElementsThatMatchTheAntipodeElement(parsed).map(x => +x));
}

function parseInput(input) {
  return input.trim().split('');
}

function filterElementsThatMatchTheNextElement(list) {
  return list.filter((el, ix, arr) => el === arr[(ix + 1) % arr.length]);
}

function filterElementsThatMatchTheAntipodeElement(list) {
  const halfLength = list.length / 2;
  return list.filter((el, ix, arr) => el === arr[(ix + halfLength) % arr.length]);
}

export default { part1, part2 };
