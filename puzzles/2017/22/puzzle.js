import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { coords2str, str2coords } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { infected } = parseInput(input);

  const turtle = {
    position: { x: 0, y: 0 },
    heading: 'UP',
    infectionCount: 0,
  };

  // yield(frame(renderField(turtle, infected), `burst 0 | ${turtle.infectionCount} infected`));

  for(let i = 0; i < 10000; ++i) {
    burst(turtle, infected);
    // yield(frame(renderField(turtle, infected), `burst ${i + 1} | ${turtle.infectionCount} infected`));
  }

  // yield(frame(renderField(turtle, infected), `burst 10000 | ${turtle.infectionCount} infected`));
  return turtle.infectionCount;
}

async function* part2(input, options = {}) {
  const { infected, weakened, flagged } = parseInput(input);

  const turtle = {
    position: { x: 0, y: 0 },
    heading: 'UP',
    infectionCount: 0,
  };

  // yield(frame(renderField(turtle, infected), `burst 0 | ${turtle.infectionCount} infected`));

  for(let i = 0; i < 10000000; ++i) {
    burst2(turtle, infected, weakened, flagged);
    // yield(frame(renderField(turtle, infected), `burst ${i + 1} | ${turtle.infectionCount} infected`));
  }

  // yield(frame(renderField(turtle, infected), `burst 10000 | ${turtle.infectionCount} infected`));
  return turtle.infectionCount;
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  const offset = (lines.length - 1) / 2;
  const infected = new Set();
  for(let y = 0; y < lines.length; ++y) {
    for(let x = 0; x < lines[y].length; ++x) {
      if(lines[y][x] === '#') {
        infected.add(coords2str({ x: (+x) - offset, y: (+y) - offset}));
      }
    }
  }

  return {
    infected,
    weakened: new Set(),
    flagged: new Set(),
  };
}

const MOVES = {
  UP:    { x:  0, y: -1 },
  DOWN:  { x:  0, y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x:  1, y:  0 },
};
const TURN_LEFT    =  { UP: 'LEFT', LEFT: 'DOWN', DOWN: 'RIGHT', RIGHT: 'UP' };
const TURN_RIGHT   =  { UP: 'RIGHT', RIGHT: 'DOWN', DOWN: 'LEFT', LEFT: 'UP' };
const TURN_REVERSE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }

function burst(turtle, infected) {
  const positionStr = coords2str(turtle.position);
  const isCurrentPositionInfected = infected.has(positionStr);

  // if the current node is infected, turn right
  // if not, turn left
  turtle.heading = isCurrentPositionInfected ? TURN_RIGHT[turtle.heading] : TURN_LEFT[turtle.heading];

  // toggle the current node
  if(isCurrentPositionInfected) {
    infected.delete(positionStr);
  } else {
    infected.add(positionStr);
    turtle.infectionCount++;
  }

  // move forward
  turtle.position.x += MOVES[turtle.heading].x;
  turtle.position.y += MOVES[turtle.heading].y;
}

function burst2(turtle, infected, weakened, flagged) {
  const positionStr = coords2str(turtle.position);

  const isCurrentPositionInfected = infected.has(positionStr);
  const isCurrentPositionWeakened = weakened.has(positionStr);
  const isCurrentPositionFlagged = flagged.has(positionStr);

  // redirect the heading: clean -> left, weakened -> noop, infected -> right, flagged -> reverse
  if(isCurrentPositionInfected) {
    turtle.heading = TURN_RIGHT[turtle.heading];
  } else if(isCurrentPositionFlagged) {
    turtle.heading = TURN_REVERSE[turtle.heading];
  } else if(isCurrentPositionWeakened) {
    // noop
  } else {
    turtle.heading = TURN_LEFT[turtle.heading];
  }

  // cycle the current node: clean -> weakened -> infected -> flagged -> clean
  if(isCurrentPositionInfected) {
    infected.delete(positionStr);
    flagged.add(positionStr);
  } else if(isCurrentPositionFlagged) {
    flagged.delete(positionStr);
  } else if(isCurrentPositionWeakened) {
    weakened.delete(positionStr);
    infected.add(positionStr);
    turtle.infectionCount++;
  } else {
    weakened.add(positionStr);
  }

  // move forward
  turtle.position.x += MOVES[turtle.heading].x;
  turtle.position.y += MOVES[turtle.heading].y;
}

function renderField(turtle, infected) {
  const infectedCoords = [...infected].map(str2coords);
  const offset = infectedCoords.reduce((max, {x, y}) => {
    if(Math.abs(x) > max) { return Math.abs(x); }
    if(Math.abs(y) > max) { return Math.abs(y); }
    return max;
  }, 0);

  const fieldSize = (offset * 2) + 1;
  const field = Array(fieldSize).fill(0).map((_, row) => Array(fieldSize).fill(0).map((_, col) => {
    const x = col - offset;
    const y  = row - offset;

    if(turtle.position.x === x && turtle.position.y === y) { return chalk.green('@'); }
    if(infected.has(coords2str({ x, y }))) { return chalk.yellow('#'); }
    return chalk.gray('.');
  }).join('')).join('\n');

  return field;
}

export default { part1, part2 };
