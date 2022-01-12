import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

const UP = '(';
const DOWN = ')';

async function part1(input) {
  const directions = parseInput(input);

  const up = directions.filter(char => char === UP).length;
  const down = directions.filter(char => char === DOWN).length;

  return up - down;
}

async function part2(input) {
  const directions = parseInput(input);

  let floor = 0;
  let step;
  for(step in directions) {
    if(directions[step] === UP) { floor++; }
    if(directions[step] === DOWN) { floor--; }

    if(floor < 0) {
      break;
    }
  }

  return (+step) + 1;
}

function parseInput(input) {
  return input.trim().split('');
}

export default { part1, part2 };
