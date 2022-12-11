import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { CPU } from '#utils/cpu';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const instructions = parseInput(input);

  const coprocessor = new CPU(X_OPERATIONS, { mul_count: 0 }, instructions);
  await coprocessor.run();

  return coprocessor.registers.mul_count;
}

async function* part2(input, options = {}) {
  const instructions = parseInput(input);

  const coprocessor = new CPU(X_OPERATIONS, { mul_count: 0, a: 1 }, instructions);
  while(!coprocessor.flags.halt) {
    await coprocessor.step();

    const registers = Object.keys(coprocessor.registers).sort().map(key => `${key}: ${coprocessor.registers[key]}`).join('\n');
    // yield frame(registers, `counter: ${coprocessor.counter}`);
  }

  const registers = Object.keys(coprocessor.registers).sort().map(key => `${key}: ${coprocessor.registers[key]}`).join('\n');
  yield frame(registers, `counter: ${coprocessor.counter}`);
  return coprocessor.registers.h;
}

function parseInput(input) {
  return input.trim().split('\n').filter(line => !line.startsWith('#')).map(line => CPU.makeInstruction(...line.split(' ')));
}

const X_OPERATIONS = {
  'set': ([x, y], cpu) => { cpu.registers[x] = cpu.val(y); },
  'sub': ([x, y], cpu) => { cpu.registers[x] = cpu.val(x) - cpu.val(y); },
  'mul': ([x, y], cpu) => {
    cpu.registers[x] = cpu.val(x) * cpu.val(y);
    cpu.registers.mul_count += 1;
  },
  'jnz': ([x, y], cpu) => {
    if(cpu.val(x) !== 0) {
      cpu.counter += cpu.val(y);
      cpu.flags.jump = true;
    }
  },
};
async function runCoprocessor(instructions, registers = {}) {
  const coprocessor = new CPU(X_OPERATIONS, { mul_count: 0, ...registers }, instructions);

  await coprocessor.run();
  return coprocessor;
}

export default { part1, part2 };
