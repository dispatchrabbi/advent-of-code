import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { ints } from '#utils/parse';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const dataHistories = parseInput(input);

  const nextValues = dataHistories.map(history => predictNextValue(history));

  return sum(nextValues);
}

async function* part2(input, options = {}) {
  const dataHistories = parseInput(input);
  const reversedHistories = dataHistories.map(history => history.reverse());

  const previousValues = reversedHistories.map(history => predictNextValue(history));

  return sum(previousValues);
}

function parseInput(input) {
  return input.trimEnd().split('\n').map(line => line.split(' ').map(x => +x));
}

function predictNextValue(sequence) {
  const sequences = [ sequence ];

  // break the sequence down until it's all zeros
  while(!sequences[sequences.length - 1].every(el => el === 0)) {
    const differences = sequences[sequences.length - 1].map((el, ix, arr) => el - (ix === 0 ? 0 : arr[ix - 1])).slice(1);
    sequences.push(differences);
  }

  for(let i = sequences.length - 2; i >= 0; --i) {
    const lastFromPrevSequence = sequences[i + 1][sequences[i + 1].length - 1];
    const lastFromThisSequence = sequences[i][sequences[i].length - 1];
    sequences[i].push(lastFromPrevSequence + lastFromThisSequence);
  }

  return sequences[0][sequences[0].length - 1];
}

export default { part1, part2 };
