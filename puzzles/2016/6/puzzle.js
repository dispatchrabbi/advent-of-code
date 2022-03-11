import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { transpose } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const transmissions = parseInput(input);

  const message = errorCorrectTransmisssions(transmissions, true);

  return message;
}

async function* part2(input, options = {}) {
  const transmissions = parseInput(input);

  const message = errorCorrectTransmisssions(transmissions, false);

  return message;
}

function parseInput(input) {
  return input.trim().split('\n');
}

function errorCorrectTransmisssions(transmissions, selectMostFrequentLetter = true) {
  const letterInstances = transpose(transmissions.map(t => t.split('')));

  const correctedMessage = letterInstances.map(letters => {
    const counts = letters.reduce((counts, letter) => {
      counts[letter] = (counts[letter] || 0) + 1;
      return counts;
    }, {});

    if(selectMostFrequentLetter) {
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    } else {
      return Object.entries(counts).sort((a, b) => a[1] - b[1])[0][0];
    }
  }).join('');

  return correctedMessage;
}

export default { part1, part2 };
