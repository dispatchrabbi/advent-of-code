import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { Intcode } from '../common/intcode.js';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const program = parseInput(input);

  const result = await runGravityAssist(program, 12, 2);
  return result;
}

async function* part2(input, options = {}) {
  const program = parseInput(input);

  let noun, verb;
  top: for(noun = 0; noun <= 99; ++noun) {
    for(verb = 0; verb <= 99; ++verb) {
      const result = await runGravityAssist(program, noun, verb);
      if(result === 19690720) { break top; }
    }
  }

  return (noun * 100) + verb;
}

function parseInput(input) {
  return input.trim().split(',').map(x => +x);
}

async function runGravityAssist(program, noun, verb) {
  const cpu = new Intcode(program);
  cpu.memory[1] = noun;
  cpu.memory[2] = verb;

  await cpu.run();

  return cpu.memory[0];
}

export default { part1, part2 };
