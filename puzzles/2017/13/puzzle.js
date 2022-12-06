import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const scannerDepths = parseInput(input);

  const severities = scannerDepths
    .filter(([depth, range]) => isScannerOnTop(range, depth))
    .map(([depth, range]) => depth * range);

  return sum(severities);
}

async function* part2(input, options = {}) {
  const scannerDepths = parseInput(input);

  let delay = 0;
  outer: while(true) {
    if(scannerDepths.every(([depth, range]) => !isScannerOnTop(range, depth + delay))) {
      break;
    } else {
      ++delay;
    }
  }

  return delay;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(': ').map(x => +x));
}

function isScannerOnTop(range, picoseconds) {
  return picoseconds % (2 * (range - 1)) === 0;
}

export default { part1, part2 };
