import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const passphrases = parseInput(input);

  return passphrases.filter(validatePassphrase).length;
}

async function* part2(input, options = {}) {
  const passphrases = parseInput(input);

  return passphrases.filter(validatePassphrase2).length;
}

function parseInput(input) {
  return input.trim().split('\n');
}

function validatePassphrase(passphrase) {
  const words = passphrase.split(' ');

  const seen = new Set();
  for(let word of words) {
    if(seen.has(word)) {
      return false;
    }

    seen.add(word);
  }
  return true;
}

function validatePassphrase2(passphrase) {
  const words = passphrase.split(' ')
    .map(word => word.split('').sort().join(''));

  const seen = new Set();
  for(let word of words) {
    if(seen.has(word)) {
      return false;
    }

    seen.add(word);
  }
  return true;
}

export default { part1, part2 };
