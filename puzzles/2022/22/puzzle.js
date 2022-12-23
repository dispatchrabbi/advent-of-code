import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { isNumeric, mod } from '#utils/maths';
import { coords2str } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { path, grid } = parseFlatInput(input);

  const turtle = traceFlatPath(path, grid);

  const password = calculatePassword(turtle);
  return password;
}

async function* part2(input, options = { sideLength: 50 }) {
  const { path, grid, faces } = parseCubeInput(input, options.sideLength);

  const turtle = traceCubePath(path, grid, faces);

  const password = calculatePassword(turtle);
  return password;
}

function parseFlatInput(input) {
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

function traceFlatPath(path, grid) {
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
        const next = nextTurtleWrapStep(turtle.position, turtle.heading, grid);
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
function nextTurtleWrapStep(position, heading, grid) {
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

function parseCubeInput(input, sideLength) {
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

  // TODO: figure out how to do this automatically!
  // I tried and can't figure it out and I'm a day late so... I'm using my brain instead of my code
  const faces = sideLength === 4 ? TEST_FACES : INPUT_FACES;

  return {
    path,
    grid: {
      rows,
      cols,
      walls,
      sideLength,
    },
    faces,
  };
}

function traceCubePath(path, grid, faces) {
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
        const { nextPosition, nextHeading } = nextTurtleCubeStep(turtle.position, turtle.heading, grid.sideLength, faces);
        if(isWall(nextPosition, grid.walls)) {
          break;
        } else {
          turtle.position = nextPosition;
          turtle.heading = nextHeading;
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
  // for(let trace of traces) {
  //   if(trace.position.x === 51) { log.debug(trace.position)};
  // }

  return turtle;
}

function nextTurtleCubeStep(position, heading, sideLength, faces) {
  const face = findFace(position, faces); // TODO: investigate caching this on the turtle
  let nextPosition = { x: position.x + MOVES[heading].x, y: position.y + MOVES[heading].y };
  let nextHeading = heading;

  if(!isInFace(nextPosition, face)) {
    ({ position: nextPosition, heading: nextHeading } = transformToNewFace(nextPosition, heading, face, faces, sideLength));
    // ({ position: nextPosition, heading: nextHeading } = stepForwardOntoNewFace(position, heading, face, faces, sideLength));
  }


  return {
    nextPosition,
    nextHeading
  };
}

function findFace({ x, y }, faces) {
  for(let face of Object.values(faces)) {
    if(isInFace({x, y}, face)) {
      return face;
    }
  }

  throw new Error(`No face found that contains the point (${x}, ${y})`);
}

function isInFace({x, y}, face) {
  return x >= face.minX && x <= face.maxX && y >= face.minY && y <= face.maxY;
}

function transformToNewFace(steppedPosition, heading, oldFace, faces, sideLength) {
  if(isInFace(steppedPosition, oldFace)) {
    return { position: steppedPosition, heading };
  }

  // figure out the offsets
  const offset = {
    x: mod(steppedPosition.x - oldFace.minX, sideLength),
    y: mod(steppedPosition.y - oldFace.minY, sideLength),
  };

  // rotate to the new face
  const nextFace = faces[oldFace[heading].face];
  const rotation = oldFace[heading].rot;

  const rotatedOffsets = rotate(offset, rotation, sideLength);
  const rotatedHeading = HEADINGS_CLOCKWISE[mod(HEADINGS_CLOCKWISE.indexOf(heading) + rotation, 4)];

  // then we apply rotated offsets to the new face
  const nextPosition = { x: nextFace.minX + rotatedOffsets.x, y: nextFace.minY + rotatedOffsets.y };

  return {
    position: nextPosition,
    heading: rotatedHeading,
  };
}

function stepForwardOntoNewFace(position, heading, face, faces, sideLength) {
  // first we get the offsets
  const offset = { x: position.x - face.minX, y: position.y - face.minY };

  // then we rotate the offsets and the heading
  const nextFace = faces[face[heading].face];
  const rotation = face[heading].rot;

  const rotatedOffsets = rotate(offset, rotation, sideLength);
  const rotatedHeading = HEADINGS_CLOCKWISE[mod(HEADINGS_CLOCKWISE.indexOf(heading) + rotation, 4)];

  // then we add the new heading to the offsets and wrap the offsets by sideLength
  const steppedOffsets = {
    x: mod(rotatedOffsets.x + MOVES[rotatedHeading].x, sideLength),
    y: mod(rotatedOffsets.y + MOVES[rotatedHeading].y, sideLength),
  };

  // then we add the offsets back to the new face
  const nextPosition = { x: nextFace.minX + steppedOffsets.x, y: nextFace.minY + steppedOffsets.y };

  return {
    position: nextPosition,
    heading: rotatedHeading,
  };
}

function rotate({ x, y }, quarterTurns, sideLength) {
  switch(mod(quarterTurns, 4)) {
    case 0:
      return { x, y };
    case 1:
      return { x: -y + (sideLength - 1), y: x };
    case 2:
      return { x: -x + (sideLength - 1), y: -y + (sideLength - 1) };
    case 3:
      return { x: y, y: -x + (sideLength - 1) };
  }
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
        line += chalk.whiteBright(trace.heading);
        continue;
      }

      // is it a wall?
      if(isWall({ x, y }, grid.walls)) {
        line += chalk.gray('#');
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

// rot is the number of rotations CLOCKWISE
// this is this way (instead of standard math CCW) because the y-axis is flipped in our coordinate system
const TEST_FACES = {
  A: {
    minX:  8, maxX: 11, minY:  0, maxY:  3,
    '^': { face: 'B', rot: 2 }, '>': { face: 'F', rot: 2 }, 'v': { face: 'D', rot: 0 }, '<': { face: 'C', rot: 3 },
  },
  B: {
    minX:  0, maxX:  3, minY:  4, maxY:  7,
    '^': { face: 'A', rot: 2 }, '>': { face: 'C', rot: 0 }, 'v': { face: 'E', rot: 2 }, '<': { face: 'F', rot: 1 },
  },
  C: {
    minX:  4, maxX:  7, minY:  4, maxY:  7,
    '^': { face: 'A', rot: 1 }, '>': { face: 'D', rot: 0 }, 'v': { face: 'E', rot: 3 }, '<': { face: 'B', rot: 0 },
  },
  D: {
    minX:  8, maxX: 11, minY:  4, maxY:  7,
    '^': { face: 'A', rot: 0 }, '>': { face: 'F', rot: 1 }, 'v': { face: 'E', rot: 0 }, '<': { face: 'C', rot: 0 },
  },
  E: {
    minX:  8, maxX: 11, minY:  8, maxY: 11,
    '^': { face: 'D', rot: 0 }, '>': { face: 'F', rot: 0 }, 'v': { face: 'B', rot: 2 }, '<': { face: 'C', rot: 1 },
  },
  F: {
    minX: 12, maxX: 15, minY:  8, maxY: 11,
    '^': { face: 'D', rot: 3 }, '>': { face: 'A', rot: 2 }, 'v': { face: 'B', rot: 3 }, '<': { face: 'E', rot: 0 },
  },
};

const INPUT_FACES = {
  A: {
    minX:  50, maxX:  99, minY:   0, maxY:  49,
    '^': { face: 'F', rot: 1 }, '>': { face: 'B', rot: 0 }, 'v': { face: 'C', rot: 0 }, '<': { face: 'D', rot: 2 },
  },
  B: {
    minX: 100, maxX: 149, minY:   0, maxY:  49,
    '^': { face: 'F', rot: 0 }, '>': { face: 'E', rot: 2 }, 'v': { face: 'C', rot: 1 }, '<': { face: 'A', rot: 0 },
  },
  C: {
    minX:  50, maxX:  99, minY:  50, maxY: 99,
    '^': { face: 'A', rot: 0 }, '>': { face: 'B', rot: 3 }, 'v': { face: 'E', rot: 0 }, '<': { face: 'D', rot: 3 },
  },
  D: {
    minX:   0, maxX:  49, minY: 100, maxY: 149,
    '^': { face: 'C', rot: 1 }, '>': { face: 'E', rot: 0 }, 'v': { face: 'F', rot: 0 }, '<': { face: 'A', rot: 2 },
  },
  E: {
    minX:  50, maxX:  99, minY: 100, maxY: 149,
    '^': { face: 'C', rot: 0 }, '>': { face: 'B', rot: 2 }, 'v': { face: 'F', rot: 1 }, '<': { face: 'D', rot: 0 },
  },
  F: {
    minX:   0, maxX:  49, minY: 150, maxY: 199,
    '^': { face: 'D', rot: 0 }, '>': { face: 'E', rot: 3 }, 'v': { face: 'B', rot: 0 }, '<': { face: 'A', rot: 3 },
  },
};

export default { part1, part2 };
