import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { overlaps, contains } from '#utils/span';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const assignmentPairs = parseInput(input);

  const contained = assignmentPairs.filter(([elf1, elf2]) => contains(elf1, elf2) || contains(elf2, elf1));

  return contained.length;
}

async function* part2(input, options = {}) {
  const assignmentPairs = parseInput(input);

  const overlapped = assignmentPairs.filter(([elf1, elf2]) => overlaps(elf1, elf2));

  return overlapped.length;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(',').map(assignment => assignment.split('-').map(x => +x)));
}

export default { part1, part2 };
