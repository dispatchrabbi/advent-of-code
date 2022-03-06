import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { outputRegister: "b" }) {
  const instructions = parseInput(input);
  const registers = executeProgram(instructions);

  return registers[options.outputRegister];
}

async function* part2(input, options = { outputRegister: "b" }) {
  const instructions = parseInput(input);
  const registers = executeProgram(instructions, { a: 1 });

  return registers[options.outputRegister];
}

function parseInput(input) {
  return input.trim().split('\n').map(instructionLine => {
    const opcode = instructionLine.substr(0, 3);
    const operands = instructionLine.substr(4).split(', ').map(x => (x[0] === '-' || x[0] === '+') ? +x : x);
    return { opcode, operands };
  });
}

function executeProgram(instructions, registerDefaults = {}) {
  let INSTRUCTION_COUNTER = 0;
  const REGISTERS = {
    a: registerDefaults.a || 0,
    b: registerDefaults.b || 0
  };
  const FLAGS = {
    jump: false,
  };

  const OPCODES = {
    hlf: (r) => { REGISTERS[r] = REGISTERS[r] / 2 },
    tpl: (r) => { REGISTERS[r] = REGISTERS[r] * 3 },
    inc: (r) => { REGISTERS[r] += 1 },
    jmp: (offset) => {
      INSTRUCTION_COUNTER += offset;
      FLAGS.jump = true;
    },
    jie: (r, offset) => {
      if(REGISTERS[r] % 2 === 0) {
        INSTRUCTION_COUNTER += offset;
        FLAGS.jump = true;
      }
    },
    jio: (r, offset) => {
      if(REGISTERS[r] === 1) {
        INSTRUCTION_COUNTER += offset;
        FLAGS.jump = true;
      }
    },
  };

  while(INSTRUCTION_COUNTER < instructions.length) {
    log.debug(formatComputerState(INSTRUCTION_COUNTER, REGISTERS, FLAGS, instructions) + '\n');

    // reset the flags
    FLAGS.jump = false;

    // execute the instruction
    const instruction = instructions[INSTRUCTION_COUNTER];
    OPCODES[instruction.opcode](...instruction.operands);

    // if we did not jump, increment the instruction counter
    if(!FLAGS.jump) {
      INSTRUCTION_COUNTER++;
    }
  }

  return REGISTERS;
}

function formatComputerState(instructionCounter, registers, flags, instructions) {
  const instruction = instructions[instructionCounter];
  const registerText = Object.keys(registers).map(r => `${r}: ${registers[r]}`).join('\n');
  return `
COMPUTER STATE:
${registerText}
JUMP: ${flags.jump ? 'TRUE' : 'FALSE'}
IC: ${instructionCounter}
INS: ${instruction.opcode} ${instruction.operands.join(', ')}
`.trim();
}

export default { part1, part2 };
