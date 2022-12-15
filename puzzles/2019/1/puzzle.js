import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const masses = parseInput(input);

  const fuel = sum(masses.map(calculateFuel));

  return fuel;
}

async function* part2(input, options = {}) {
  const masses = parseInput(input);

  const fuel = sum(masses.map(recursivelyCalculateFuel));

  return fuel;
}

function parseInput(input) {
  return input.trim().split('\n').map(x => +x);
}

function calculateFuel(mass) {
  return Math.floor(mass / 3) - 2;
}

function recursivelyCalculateFuel(mass) {
  let fuel = 0;
  while(mass > 0) {
    mass = calculateFuel(mass);
    if(mass > 0 ) { fuel += mass; }
  }
  return fuel;
}

export default { part1, part2 };
