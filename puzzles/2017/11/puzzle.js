import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { Hex, FLAT_STEPS as STEPS } from '#utils/hex';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const steps = parseInput(input);

  const bigStep = steps.map(step => STEPS[step.toUpperCase()]).reduce((total, step) => ([total[0] + step[0], total[1] + step[1]]), [0, 0]);
  const endHex = new Hex(bigStep[0], bigStep[1]);

  return endHex.distanceFrom(new Hex(0, 0));
}

async function* part2(input, options = {}) {
  const steps = parseInput(input);
  let maxDistance = 0;

  const ORIGIN = new Hex(0, 0);
  const currentHex = new Hex(0, 0);
  for(let step of steps) {
    currentHex.step(STEPS[step.toUpperCase()]);
    maxDistance = Math.max(maxDistance, currentHex.distanceFrom(ORIGIN));
  }

  return maxDistance;
}

function parseInput(input) {
  return input.trim().split(',');
}

export default { part1, part2 };
