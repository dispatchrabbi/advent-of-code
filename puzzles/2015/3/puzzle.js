import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { coords2str } from '../../../utils/grid.js';

const [ NORTH, SOUTH, EAST, WEST ] = [ '^', 'v', '>', '<' ];

async function part1(input) {
  const steps = parseInput(input);

  const position = { x: 0, y: 0 };
  const houses = new Set([coords2str(position)]);

  for(let step of steps) {
    moveSanta(position, step);
    houses.add(coords2str(position));
  }

  return houses.size;
}

async function part2(input) {
  const steps = parseInput(input);

  const regularSantaPosition = { x: 0, y: 0 };
  const roboSantaPosition = { x: 0, y: 0 };
  const houses = new Set([coords2str(regularSantaPosition)]);

  for(let stepNum in steps) {
    if(stepNum % 2) {
      moveSanta(regularSantaPosition, steps[stepNum]);
      houses.add(coords2str(regularSantaPosition));
    } else {
      moveSanta(roboSantaPosition, steps[stepNum]);
      houses.add(coords2str(roboSantaPosition));
    }
  }

  return houses.size;
}

function parseInput(input) {
  return input.trim().split('');
}

function moveSanta(position, step) {
  switch(step) {
    case NORTH:
      position.y++;
      break;
    case SOUTH:
      position.y--;
      break;
    case EAST:
      position.x++;
      break;
    case WEST:
      position.x--;
      break;
    default:
      break;
  }

  return position;
}

export default { part1, part2 };
