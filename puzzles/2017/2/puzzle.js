import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const rows = parseInput(input);
  const checksum = calculateChecksum(rows);

  return checksum;
}

async function* part2(input, options = {}) {
  const rows = parseInput(input);
  const checksum = calculateDivisorSum(rows);

  return checksum;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(/\s+/).map(x => +x));
}

function calculateChecksum(rows) {
  return sum(rows.map(r => Math.max(...r) - Math.min(...r)));
}

function calculateDivisorSum(rows) {
  return sum(rows.map(r => {
    const [ dividend, divisor ] = findDivisiblePair(r);
    return dividend / divisor;
  }));
}

function findDivisiblePair(row) {
  for(let i = 0; i < row.length; ++i) {
    for(let j = i+1; j < row.length; ++j) {
      if(row[i] % row[j] === 0) {
        return [ row[i], row[j] ];
      } else if(row[j] % row[i] === 0) {
        return [ row[j], row[i] ];
      }
    }
  }

  // we do know that there will be a pair somewhere in the line, but just in case:
  return [ NaN, NaN ];
}

export default { part1, part2 };
