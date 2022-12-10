import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const grid = parseInput(input);
  const turtleGen = followPath(grid);

  let next, turtle;
  while(next = turtleGen.next()) {
    if(next.done) {
      turtle = next.value;
      break;
    }

    turtle = next.value;
    // yield(frame(drawGrid(grid, turtle), `he's a-movin!`));
  }

  return turtle.inventory.join('');
}

async function* part2(input, options = {}) {
  const grid = parseInput(input);
  const turtleGen = followPath(grid);

  let next, turtle;
  while(next = turtleGen.next()) {
    if(next.done) {
      turtle = next.value;
      break;
    }

    turtle = next.value;
    // yield(frame(drawGrid(grid, turtle), `he's a-movin!`));
  }

  return turtle.stepCounter;
}

function parseInput(input) {
  let lines = input.split('\n').filter(line => line.length > 0);
  const maxLineLength = lines.reduce((max, line) => line.length > max ? line.length : max, -Infinity);
  lines = lines.map(line => (line + ' '.repeat(maxLineLength - line.length)).split(''));
  return lines;
}

const DIRECTIONS = {
  UP:    { x:  0, y: -1 },
  DOWN:  { x:  0, y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x:  1, y:  0 },
};
function* followPath(grid) {
  let turtle = {
    position: { x: grid[0].indexOf('|'), y: 0 },
    heading: DIRECTIONS.DOWN,
    inventory: [],
    stepCounter: 0,
  };

  while(true) {
    yield turtle;

    turtle.position = addPositionAndHeading(turtle.position, turtle.heading);
    turtle.stepCounter++;

    const space = gridSpace(grid, turtle.position);

    if(space === '|' || space === '-') {
      // no-op, just keep going
    } else if(space === '+') {
      if(turtle.heading.x === 0) {
        // time to switch to left or right
        if(gridSpace(grid, addPositionAndHeading(turtle.position, DIRECTIONS.LEFT)) !== ' ') {
          turtle.heading = DIRECTIONS.LEFT;
        } else if(gridSpace(grid, addPositionAndHeading(turtle.position, DIRECTIONS.RIGHT)) !== ' ') {
          turtle.heading = DIRECTIONS.RIGHT;
        }
      } else if(turtle.heading.y === 0) {
        // time to switch to up or down
        if(gridSpace(grid, addPositionAndHeading(turtle.position, DIRECTIONS.UP)) !== ' ') {
          turtle.heading = DIRECTIONS.UP;
        } else if(gridSpace(grid, addPositionAndHeading(turtle.position, DIRECTIONS.DOWN)) !== ' ') {
          turtle.heading = DIRECTIONS.DOWN;
        }
      }
    } else if(/[A-Z]/.test(space)) {
      turtle.inventory.push(space);
    } else {
      break;
    }
  }

  return turtle;
}

function gridSpace(grid, { x, y }) {
  return grid[y][x];
}

function addPositionAndHeading(position, heading) {
  return {
    x: position.x + heading.x,
    y: position.y + heading.y
  };
}

function drawGrid(grid, turtle) {
  return grid.map((line, y) => line.map((char, x) => {
    if(turtle.position.x === x && turtle.position.y === y) {
      return chalk.green('⌘');
    } else if(char === ' ') {
      return chalk.gray('.');
    } else {
      return chalk.yellow(char);
    }
  }).join('')).join('\n');
}

export default { part1, part2 };
