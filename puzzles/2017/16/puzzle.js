import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { rotate } from '#utils/arr';
import { isNumeric } from '#utils/maths';
import { deepEquals } from '#utils/obj';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { numberOfPrograms: 16 }) {
  const instructions = parseInput(input);

  const LITTLE_A = 'a'.charCodeAt(0);
  let programs = Array(options.numberOfPrograms).fill(0).map((_, ix) => String.fromCharCode(LITTLE_A + ix));

  programs = performDance(programs, instructions);
  return programs.join('');
}

async function* part2(input, options = { numberOfPrograms: 16 }) {
  const instructions = parseInput(input);

  const LITTLE_A = 'a'.charCodeAt(0);
  let programs = Array(options.numberOfPrograms).fill(0).map((_, ix) => String.fromCharCode(LITTLE_A + ix));

  const period = findPeriod(programs, instructions);
  log.debug(period);

  const remainder = 1000000000 % period;
  for(let i = 0; i < remainder; ++i) {
    programs = performDance(programs, instructions);
  }

  return programs.join('');
}

function parseInput(input) {
  return input.trim().split(',').map(instr => ({
    opcode: instr[0],
    args: instr.slice(1).split('/').map(x => isNumeric(x) ? +x : x),
  }));
}

function performDance(programs, instructions) {
  for(let instruction of instructions) {
    switch(instruction.opcode) {
      case 's':
        programs = rotate(programs, instruction.args[0])
        break;
      case 'x':
        [ programs[instruction.args[0]], programs[instruction.args[1]] ] = [ programs[instruction.args[1]], programs[instruction.args[0]] ];
        break;
      case 'p':
        const [ ix_a, ix_b ] = [ programs.indexOf(instruction.args[0]), programs.indexOf(instruction.args[1]) ];
        [ programs[ix_a], programs[ix_b] ] = [ programs[ix_b], programs[ix_a] ];
        break;
      default:
        throw new Error(`Unknown opcode ${instruction.opcode}: ${instruction}`);
        break;
    }
  }

  return programs;
}

function findPeriod(programs, instructions) {
  let expected = programs.slice();
  let counter = 0;

  do {
    ++counter;
    programs = performDance(programs, instructions);
  } while(!deepEquals(expected, programs));

  return counter;
}

export default { part1, part2 };
