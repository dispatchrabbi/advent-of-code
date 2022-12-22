import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { isNumeric, mod } from '#utils/maths';
import { coords2str } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { path, grid } = parseInput(input);

  const turtle = tracePath(path, grid);

  const password = calculatePassword(turtle);
  return password;
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

function parseInput(input) {
  const lines = input.trimEnd().split('\n');

  // deal with the directions first
  const DIRECTIONS_REGEX = /(\d+)([L|R])?/g;
  const pathLine = lines.pop().trim();
  const path = Array.from(pathLine.matchAll(DIRECTIONS_REGEX), a => a.slice(1).filter(x => x).map(x => isNumeric(x) ? +x : x)).flat();

  lines.pop(); // blank line - discard

  // now to parse the grid
  const rows = [];
  const cols = [];
  const walls = new Set();

  for(let row = 0; row < lines.length; ++row) {
    for(let col = 0; col < lines[row].length; ++col) {
      if(!rows[row]) { rows[row] = { min: Infinity, max: -Infinity }; }
      if(!cols[col]) { cols[col] = { min: Infinity, max: -Infinity }; }

      const cell = lines[row][col];
      if(cell !== ' ') {
        rows[row].min = Math.min(col, rows[row].min);
        rows[row].max = Math.max(col, rows[row].max);

        cols[col].min = Math.min(row, cols[col].min);
        cols[col].max = Math.max(row, cols[col].max);
      }

      if(cell === '#') {
        walls.add(coords2str({ y: row, x: col }));
      }
    }
  }

  return {
    path,
    grid: {
      rows,
      cols,
      walls
    },
  };
}

function tracePath(path, grid) {
  const turtle = {
    position: { x: grid.rows[0].min, y: 0},
    heading: '>',
  };

  const traces = [];
  traces.push({...turtle});

  for(let step of path) {
    if(isNumeric(step)) {
      // move the turtle until we hit a wall
      for(let i = 0; i < step; ++i) {
        const next = nextTurtleStep(turtle.position, turtle.heading, grid);
        if(isWall(next, grid.walls)) {
          break;
        } else {
          turtle.position = next;
          traces.push({...turtle});
        }
      }
    } else {
      // change heading
      turtle.heading = changeHeading(turtle.heading, step);
      traces.push({...turtle});
    }
  }

  log.debug(formatGrid(grid, traces));
  return turtle;
}

const MOVES = {
  '<': { x: -1, y:  0 },
  '>': { x:  1, y:  0 },
  '^': { x:  0, y: -1 },
  'v': { x:  0, y:  1 },
};
function nextTurtleStep(position, heading, grid) {
  const next = { x: position.x + MOVES[heading].x, y: position.y + MOVES[heading].y };

  if(heading === '^' || heading === 'v') {
    if(next.y < grid.cols[next.x].min) {
      next.y = grid.cols[next.x].max;
    }

    if(next.y > grid.cols[next.x].max) {
      next.y = grid.cols[next.x].min;
    }
  }

  if(heading === '<' || heading === '>') {
    if(next.x < grid.rows[next.y].min) {
      next.x = grid.rows[next.y].max;
    }

    if(next.x > grid.rows[next.y].max) {
      next.x = grid.rows[next.y].min;
    }
  }

  return next;
}

function isWall(position, walls) {
  return walls.has(coords2str(position));
}

const HEADINGS_CLOCKWISE = [ '>', 'v', '<', '^' ];
function changeHeading(heading, dir) {
  let headingIx = HEADINGS_CLOCKWISE.indexOf(heading);
  headingIx += dir === 'L' ? -1 : dir === 'R' ? 1 : 0;

  return HEADINGS_CLOCKWISE[mod(headingIx, HEADINGS_CLOCKWISE.length)];
}

function calculatePassword(turtle) {
  return ((turtle.position.y + 1) * 1000) + ((turtle.position.x + 1) * 4) + HEADINGS_CLOCKWISE.indexOf(turtle.heading);
}

function formatGrid(grid, traces) {
  const maxX = Math.max(...grid.rows.map(row => row.max));
  const maxY = Math.max(...grid.cols.map(col => col.max));

  const out = [];

  for(let y = 0; y <= maxY; ++y) {
    let line = '';

    for(let x = 0; x <= maxX; ++x) {
      // do we have a trace for this?
      const trace = traces.findLast(t => t.position.x === x && t.position.y === y);
      if(trace) {
        line += chalk.cyan(trace.heading);
        continue;
      }

      // is it a wall?
      if(isWall({ x, y }, grid.walls)) {
        line += chalk.red('#');
        continue;
      }

      // is it a valid space?
      if(
        x >= grid.rows[y].min && x <= grid.rows[y].max &&
        y >= grid.cols[x].min && y <= grid.cols[x].max
      ) {
        line += chalk.gray('.');
        continue;
      }

      // is it just blank?
      line += ' ';
    }

    out.push(line);
  }

  return '\n' + out.join('\n');
}

export default { part1, part2 };
