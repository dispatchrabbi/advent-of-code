import path from 'path';
import fs from 'fs/promises';

import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { CPU } from '#utils/cpu';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const instructions = parseInput(input);

  const coprocessor = new CPU(X_OPERATIONS, { mul_count: 0 }, instructions);
  await coprocessor.run();

  log.debug(coprocessor.registers);
  return coprocessor.registers.mul_count;
}

async function* part2(input, options = {}) {
  // you can see the reassembled code in `reassembledCoprocessor` below (using `isPrime`, original flavor)
  // but the task is to optimize the code. So we shall do that.
  // The big issue is `isPrime`, which is real bad
  // We can do that if we have access to `mod`. So:
  const OPTIMIZED_OPERATIONS = {
    ...X_OPERATIONS,
    // mod X Y sets register X to the result of modding the value contained in register X by the value of Y.
    'mod': ([x, y], cpu) => { cpu.registers[x] = cpu.val(x) % cpu.val(y) },
    // rtc X Y sets register X to the ceiling of the square root of the value of Y.
    'rtc': ([x, y], cpu) => { cpu.registers[x] = Math.ceil(Math.sqrt(cpu.val(y))); },
    // jez X Y jumps with an offset of the value of Y, but only if the value of X is zero.
    'jez': ([x, y], cpu) => {
      if(cpu.val(x) === 0) {
        cpu.counter += cpu.val(y);
        cpu.flags.jump = true;
      }
    },
  }

  // and now, to modify the instructions.
  const instructions = parseInput(input);

  // the isPrime function takes up instructions 8-23
  // we're going to modify that to use `isPrime2` instead (the new hotness)
  // it uses g as the number to test, d as test factors, and f set to 1 if prime, 0 if composite
  // we now only test up to sqrt(g) and use mod to test compositeness
  // so here's the new instructions:
  const patch = `
  set f 1
  set d 2
  set g b
  mod g d
  jnz g 3
  set f 0
  jez f 5
  sub d -1
  rtc g b
  sub g d
  jnz g -8`.trim().split('\n').map(line => CPU.makeInstruction(...line.trim().split(' ')))
  instructions.splice(8, 16, ...patch);
  // modify the last instruction's jump to account for the altered function: it should be (16 - patch.length) fewer steps up
  instructions[instructions.length - 1].args[1] += (16 - patch.length);

  const coprocessor = new CPU(OPTIMIZED_OPERATIONS, { mul_count: 0, a: 1 }, instructions);
  await coprocessor.run();

  log.debug(coprocessor.registers);
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

/*
a: debug
b: num
c: upperBound
d: factor1
e: factor2
f: isComposite
g: sir not appearing in this reassembly
h: compositeCount
*/
function reassembledCoprocessor(debug = false) {
  function isPrime(num) {
    let isPrime = true;

    for(let factor1 = 2; factor1 <= num; ++factor1) {
      for(let factor2 = 2; factor2 <= num; ++factor2) {
        if(factor1 * factor2 === num) {
          isPrime = false;
        }
      }
    }

    return isPrime;
  }

  function isPrime2(num) {
    for(let factor1 = 2; factor1 <= Math.ceil(Math.sqrt(num)); ++factor1) {
      if(num % factor1 === 0) {
        return false;
      }
    }

    return true;
  }

  let num = 67;
  let upperBound = 67;

  if(!debug) {
    num = 106700;
    upperBound = 123700;
  }

  let compositeCount = 0;
  for(; num <= upperBound; num += 17) {
    log.debug(num, compositeCount);
    const isComposite = !isPrime2(num);
    compositeCount += isComposite ? 1 : 0;
  }

  return compositeCount;
}

export default { part1, part2 };
