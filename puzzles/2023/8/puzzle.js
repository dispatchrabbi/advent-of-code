import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Graph } from '#utils/graph';
import { lcm } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { pattern, desert } = parseInput(input);

  const path = findPathThroughDesert(desert, 'AAA', 'ZZZ', pattern);

  return path.length - 1;
}

async function* part2(input, options = {}) {
  const { pattern, desert } = parseInput(input);

  const cycles = Object.keys(desert)
    .filter(location => location.endsWith('A'))
    .map(location => determineCycleLength(desert, pattern, location));

  return lcm(...cycles);
}

function parseInput(input) {
  const lines = input.trimEnd().split('\n');

  const pattern = lines.shift().split('');
  lines.shift(); // remove the blank line
  // ABC = (DEF, GHI)
  const desert = lines.reduce((obj, line) => {
    obj[line.substring(0, 3)] = {
      L: line.substring(7, 10),
      R: line.substring(12, 15)
    };
    return obj;
  }, {});

  return {
    pattern,
    desert
  };
}

function findPathThroughDesert(desert, start, end, pattern) {
  let steps = [ start ];

  while(steps[steps.length - 1] !== end) {
    const current = steps[steps.length - 1];
    const direction = pattern[(steps.length - 1) % pattern.length];
    steps.push(desert[current][direction]);
  }

  return steps;
}

function determineCycleLength(desert, pattern, startingLocation) {
  let currentLocation = startingLocation;
  let steps = 0;

  while(!currentLocation.endsWith('Z')) {
    currentLocation = desert[currentLocation][pattern[steps % pattern.length]];
    steps++;
  }

  return steps;
}

export default { part1, part2 };
