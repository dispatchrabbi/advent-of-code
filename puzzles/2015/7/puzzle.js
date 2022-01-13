import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { isNumeric } from '../../../utils/math.js';

async function part1(input) {
  const instructions = parseInput(input);
  const wires = runCircuit(buildCircuit(instructions));

  return wires.a.value;
}

async function part2(input) {
  const instructions = parseInput(input);
  // override wire b with the signal from a from the last puzzle
  instructions.forEach(instruction => {
    if(instruction.to === 'b') {
      instruction.from = { operation: 'SIGNAL', operands: [ 3176 ]};
    }
  });
  const wires = runCircuit(buildCircuit(instructions));

  return wires.a.value;
}

function parseInput(input) {
  return input.trim().split('\n').map(parseInstruction);
}

function parseInstruction(line) {
  const instruction = {
    from: { operation: null, operands: [] },
    to: null
  }
  const [ left, right ] = line.split(' -> ');
  instruction.to = right;

  const parts = left.split(' ');
  if(parts.length === 1) {
    instruction.from.operation = 'SIGNAL';
    instruction.from.operands = [ parts[0] ];
  } else if(parts.length === 2) {
    instruction.from.operation = 'NOT';
    instruction.from.operands = [ parts[1] ];
  } else if(parts.length === 3) {
    instruction.from.operation = parts[1];
    instruction.from.operands = [ parts[0], parts[2] ];
  }

  instruction.from.operands = instruction.from.operands.map(x => isNumeric(x) ? +x : x);

  return instruction;
}

function buildCircuit(instructions) {
  const wires = {};
  for(let instruction of instructions) {
    wires[instruction.to] = {
      value: null,
      source: instruction.from,
    };
  }
  return wires;
}

const OPERATIONS = {
  SIGNAL: (val) => val,
  LSHIFT: (a, places) => a << places,
  RSHIFT: (a, places) => a >> places,
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  NOT: (a) => ~a,
  XOR: (a, b) => a ^ b,
};
function runCircuit(wires) {
  const WIRE_REGEX = /^[a-z]+$/;
  // doing this the dumb way; I could actually build the graph and follow it through but... eh
  while(Object.values(wires).filter(wire => wire.value === null).length > 0) {
    for(let wire of Object.values(wires).filter(wire => wire.value === null)) {
      // look up operand values
      const operands = wire.source.operands.map(operand => WIRE_REGEX.test(operand) ? wires[operand].value : operand);
      // can we compute this yet?
      if(operands.some(val => val === null)) {
        continue; // nope!
      }

      wire.value = OPERATIONS[wire.source.operation](...operands);
    }
  }

  return wires;
}

export default { part1, part2 };
