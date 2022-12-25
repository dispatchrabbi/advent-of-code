import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const snumbers = parseInput(input);

  const fuelNeeded = sum(snumbers.map(stoi));

  return itos(fuelNeeded);
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

function parseInput(input) {
  return input.trimEnd().split('\n');
}

const SNUMERALS = {
  '=': -2,
  '-': -1,
  '0': 0,
  '1': 1,
  '2': 2
};
function stoi(snumber) {
  const places = snumber.split('').map(s => SNUMERALS[s]).reverse();

  let int = 0;
  for(let pow = 0; pow < places.length; ++pow) {
    int += (5 ** pow) * places[pow];
  }

  return int;
}

const SDIGITS = [ '=', '-', '0', '1', '2' ];
const LOG_5 = Math.log(5);
function itos(int) {
  const numberOfDigits = 1 + Math.round(Math.log(int) / LOG_5);
  const snumber = [];

  for(let pow = numberOfDigits - 1; pow >= 0; --pow) {
    const place = 5 ** pow;
    const digit = Math.round(int / place);

    snumber.push(digit);
    int -= place * digit;
  }

  return snumber.map(s => SDIGITS[s + 2]).join('');
}

export default { part1, part2 };
