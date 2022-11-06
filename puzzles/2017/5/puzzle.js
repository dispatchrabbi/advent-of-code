import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const instructions = parseInput(input);

  return runProgram(instructions);
}

async function* part2(input, options = {}) {
  const instructions = parseInput(input);

  return runProgram2(instructions);
}

function parseInput(input) {
  return input.trim().split('\n').map(x => +x);
}

function runProgram(instructions) {
  let currentInstruction = 0;
  let steps = 0;
  while(currentInstruction >= 0 && currentInstruction < instructions.length) {
    steps++;

    instructions[currentInstruction]++;
    currentInstruction += (instructions[currentInstruction] - 1);
  }

  return steps;
}

function runProgram2(instructions) {
  let currentInstruction = 0;
  let steps = 0;
  while(currentInstruction >= 0 && currentInstruction < instructions.length) {
    steps++;

    const jumpDistance = instructions[currentInstruction];
    instructions[currentInstruction] += (instructions[currentInstruction] >= 3 ? -1 : 1);
    currentInstruction += jumpDistance
  }

  return steps;
}

function formatInstructions(instructions, currentInstruction) {
  return instructions.map((el, ix) => ix === currentInstruction ? `(${el})` : el.toString()).join(' ');
}

export default { part1, part2 };
