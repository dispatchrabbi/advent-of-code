import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { ints } from '#utils/parse';
import { product } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const records = parseInput1(input);

  const winningStratsPerRace = records.map(({ time, distance }) => listStrategies(time).filter(d => d > distance).length);

  return product(winningStratsPerRace);
}

async function* part2(input, options = {}) {
  const { time, distance } = parseInput2(input);

  const winningStrats = listStrategies(time).filter(d => d > distance).length;

  return winningStrats;
}

function parseInput1(input) {
  const [ times, distances ] = input.trimEnd().split('\n').map(line => ints(line));
  return times.map((time, ix) => ({ time, distance: distances[ix] }));
}

function parseInput2(input) {
  const [ time, distance ] = input.trimEnd().split('\n').map(line => +line.replace(/[^0-9]/g, ''));
  return { time, distance };
}

function listStrategies(maxTime) {
  const distances = [];
  for(let t = 0; t <= maxTime; ++t) {
    distances.push(t * (maxTime - t));
  }
  return distances;
}

export default { part1, part2 };
