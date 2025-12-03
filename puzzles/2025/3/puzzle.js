import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const banks = parseInput(input);

  const joltages = banks.map(bank => findMaximumJoltage(bank, 2));
  const combined = sum(joltages);

  return combined;
}

function findMaximumJoltage(bank, places) {
  const digitsLeft = places - 1;
  
  const maxIx = indexOfMax(bank.slice(0, bank.length - digitsLeft)); // have to leave room to find `digitsLeft` more digits
  const thisDigit = bank[maxIx];
  const restOfJoltage = digitsLeft === 0 ? 0 : findMaximumJoltage(bank.slice(maxIx + 1), digitsLeft);

  const totalJoltage = (thisDigit * (10 ** digitsLeft)) + restOfJoltage;
  return totalJoltage;
}

function indexOfMax(arr) {
  let maxIx = 0;

  for(let i = 0; i < arr.length; ++i) {
    if(arr[i] > arr[maxIx]) {
      maxIx = i;
    }
  }

  return maxIx;
}

async function* part2(input, options = {}) {
  const banks = parseInput(input);

  const joltages = banks.map(bank => findMaximumJoltage(bank, 12));
  const combined = sum(joltages);

  return combined;
}

function parseInput(input) {
  return input.trimEnd().split('\n').map(line => line.split('').map(x => +x));
}

export default { part1, part2 };
