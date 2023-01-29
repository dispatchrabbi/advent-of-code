import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Intcode } from '../common/intcode.js';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const program = parseInput(input);

  const cpu = new Intcode(program);
  await cpu.run([1]);
  const result = cpu.outputQueue;

  return result;
}

async function* part2(input, options = {}) {
  const program = parseInput(input);

  const cpu = new Intcode(program);
  await cpu.run([2]);
  const result = cpu.outputQueue;

  return result;
}

function parseInput(input) {
  return input.trimEnd().split(',').map(x => +x);
}

export default { part1, part2 };
