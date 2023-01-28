import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const [ lo, hi ] = parseInput(input);

  // there is an optimization to be made here where we don't check every value
  // because if we find a descending digit, we can skip to when we know it's ascending
  // but this is probably quick enough as-is
  let validPasswordCount = 0;
  for(let p = lo; p <= hi; ++p) {
    if(isValidPassword(p)) {
      validPasswordCount++;
    }
  }

  // log.debug(111111, isValidPassword(111111));
  // log.debug(223450, isValidPassword(223450));
  // log.debug(123789, isValidPassword(123789));

  return validPasswordCount;
}

async function* part2(input, options = {}) {
  const [ lo, hi ] = parseInput(input);

  // see part1 for the optimization note
  let validPasswordCount = 0;
  for(let p = lo; p <= hi; ++p) {
    if(isValidPassword(p, 1)) {
      validPasswordCount++;
    }
  }

  // log.debug(112233, isValidPassword(112233, 1));
  // log.debug(123444, isValidPassword(123444, 1));
  // log.debug(111122, isValidPassword(111122, 1));

  return validPasswordCount;
}

function parseInput(input) {
  return input.trimEnd().split('-').map(x => +x);
}

function isValidPassword(password, requireExactDouble = false) {
  let repeatCount = 0;
  let repeats = [];

  password = String(password);
  for(let i = 1; i < password.length; ++i) {
    if(password[i] < password[i - 1]) {
      // not ascending
      return false;
    }

    if(password[i] === password[i - 1]) {
      repeatCount++;
    } else {
      if(repeatCount > 0) { repeats.push(repeatCount); }
      repeatCount = 0;
    }
  }

  if(repeatCount > 0) { repeats.push(repeatCount); }

  return requireExactDouble ? repeats.includes(1) : repeats.length > 0;
}

export default { part1, part2 };
