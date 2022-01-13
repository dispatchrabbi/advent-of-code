import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

async function part1(input) {
  const instructions = parseInput(input);

  // You know, I haven't learned my lesson. I'm gonna do this the naive way :)
  const lights = Array(1000).fill(false).map(el => Array(1000).fill(false));
  for(let instruction of instructions) {
    executeInstruction(lights, instruction);
  }

  return countLights(lights);
}

async function part2(input) {
  const instructions = parseInput(input);

  // You know, I haven't learned my lesson. I'm gonna do this the naive way :)
  const lights = Array(1000).fill(false).map(el => Array(1000).fill(0));
  for(let instruction of instructions) {
    executeInstruction2(lights, instruction);
  }

  return countBrightness(lights);
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  const INSTRUCTIONS_REGEX = /^(turn on|turn off|toggle) (\d+),(\d+) through (\d+),(\d+)$/;
  const instructions = lines.map(line => {
    const [ _, set, x1, y1, x2, y2 ] = INSTRUCTIONS_REGEX.exec(line);
    return {
      set: set.replace('turn ', ''),
      from: { x: +x1, y: +y1 },
      to: { x: +x2, y: +y2 },
    };
  });

  return instructions;
}

function executeInstruction(lights, instruction) {
  // we don't have to care about keeping pairs together because the cross pairs are just the other corners of the rectangle
  const min = { x: Math.min(instruction.from.x, instruction.to.x), y: Math.min(instruction.from.y, instruction.to.y) };
  const max = { x: Math.max(instruction.from.x, instruction.to.x), y: Math.max(instruction.from.y, instruction.to.y) };

  for(let y = min.y; y <= max.y; ++y) {
    for(let x = min.x; x <= max.x; ++x) {
      lights[y][x] = instruction.set === 'toggle' ? !lights[y][x] : (instruction.set === 'on' ? true : false);
    }
  }

  return lights;
}

function countLights(lights) {
  return lights.reduce((total, row) => total + row.reduce((total, light) => total + (light ? 1 : 0), 0), 0);
}

function executeInstruction2(lights, instruction) {
  // we don't have to care about keeping pairs together because the cross pairs are just the other corners of the rectangle
  const min = { x: Math.min(instruction.from.x, instruction.to.x), y: Math.min(instruction.from.y, instruction.to.y) };
  const max = { x: Math.max(instruction.from.x, instruction.to.x), y: Math.max(instruction.from.y, instruction.to.y) };

  for(let y = min.y; y <= max.y; ++y) {
    for(let x = min.x; x <= max.x; ++x) {
      const increase = instruction.set === 'toggle' ? 2 : (instruction.set === 'on' ? 1 : -1);
      lights[y][x] = Math.max(0, lights[y][x] + increase);
    }
  }

  return lights;
}

function countBrightness(lights) {
  return lights.reduce((total, row) => total + row.reduce((total, light) => total + light, 0), 0);
}

export default { part1, part2 };
