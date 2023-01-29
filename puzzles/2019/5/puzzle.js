import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Intcode } from '../common/intcode.js';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { input: [ 1 ] }) {
  const program = parseInput(input);

  const computer = new Intcode(program);
  await computer.run(options.input);

  const output = computer.outputQueue;

  return output[output.length - 1];
}

async function* part2(input, options = { input: [ 5 ] }) {
  const program = parseInput(input);

  const computer = new Intcode(program);
  await computer.run(options.input);

  const output = computer.outputQueue;

  return output[output.length - 1];
}

function parseInput(input) {
  return input.trimEnd().split(',').map(x => +x);
}

export default { part1, part2 };
