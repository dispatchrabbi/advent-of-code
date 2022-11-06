import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { registerNames, instructions } = parseInput(input);

  const { registers } = executeProgram(instructions, registerNames);

  return Math.max(...Object.values(registers));
}

async function* part2(input, options = {}) {
  const { registerNames, instructions } = parseInput(input);

  const { highestValueStored } = executeProgram(instructions, registerNames);

  return highestValueStored;
}

function parseInput(input) {
  const registerNames = new Set();
  const instructions = [];

  const lines = input.trim().split('\n');
  for(let line of lines) {
    const [ target, op, amt, _, check, cond, compare ] = line.split(' ');
    registerNames.add(target).add(check);
    instructions.push({
      target,
      op,
      amt: +amt,
      check,
      cond,
      compare: +compare,
    });
  }

  return {
    registerNames: [...registerNames.keys()],
    instructions,
  };
}

function executeProgram(instructions, registerNames) {
  let highestValueStored = 0;
  const registers = registerNames.reduce((registers, name) => {
    registers[name] = 0;
    return registers;
  }, {});


  for(let inst of instructions) {
    if(checkCondition(registers, inst)) {
      registers[inst.target] += (inst.amt * (inst.op === 'dec' ? -1 : 1));
    }

    highestValueStored = Math.max(...Object.values(registers), highestValueStored);
  }

  return { registers, highestValueStored };
}

function checkCondition(registers, { check, cond, compare }) {
  switch(cond) {
    case '==':
      return registers[check] === compare;
    case '!=':
      return registers[check] !== compare;
    case '<':
      return registers[check] < compare;
    case '<=':
      return registers[check] <= compare;
    case '>':
      return registers[check] > compare;
    case '>=':
      return registers[check] >= compare;
    default:
      throw new Error(`Unrecognized condition operator ${cond} found!`);
  }
}

export default { part1, part2 };
