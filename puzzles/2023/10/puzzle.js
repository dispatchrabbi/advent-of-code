import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { areCoordsEqual, orthogonal } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { grid, start } = parseInput(input);

  const middleDistance = findMiddleOfLoop(grid, start);

  return middleDistance;
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

function parseInput(input) {
  const grid = input.trimEnd().split('\n').map(line => line.split(''));

  let start = null;
  search: for(let y in grid) {
    for(let x in grid[+y]) {
      if(grid[+y][+x] === PIPES.START) {
        start = { x: +x, y: +y };
        break search;
      }
    }
  }

  return {
    start,
    grid,
  };
}

class Mouse {
  constructor(grid, start, heading) {
    this.grid = grid;
    this.position = { x: start.x, y: start.y };
    this.heading = heading;
    this.stepCount = 0;
  }

  step() {
    // figure out our new heading
    const bend = this.grid[this.position.y][this.position.x];
    switch(bend) {
      case PIPES.NS:
        this.heading = this.heading === 'N' ? 'N' : 'S';
        break;
      case PIPES.EW:
        this.heading = this.heading === 'E' ? 'E' : 'W';
        break;
      case PIPES.NE:
        this.heading = this.heading === 'W' ? 'N' : 'E';
        break;
      case PIPES.NW:
        this.heading = this.heading === 'E' ? 'N' : 'W';
        break;
      case PIPES.SE:
        this.heading = this.heading === 'W' ? 'S' : 'E';
        break;
      case PIPES.SW:
        this.heading = this.heading === 'E' ? 'S' : 'W';
        break;
      case PIPES.START:
        // don't change the heading
        break;
      default:
        throw new Error(`unknown pipe type: ${bend}`);
    }

    // advance along the heading
    switch(this.heading) {
      case 'N':
        this.position.y -= 1;
        break;
      case 'S':
        this.position.y += 1;
        break;
      case 'E':
        this.position.x += 1;
        break;
      case 'W':
        this.position.x -= 1;
        break;
    }

    this.stepCount++;
  }

  log() {
    return {
      position: this.position,
      bend: this.grid[this.position.y][this.position.x],
      heading: this.heading,
      count: this.stepCount
    };
  }
}

function findMiddleOfLoop(grid, start) {
  const headings = findStartingPointConnections(grid, start);

  const mouse1 = new Mouse(grid, start, headings[0]);
  // log.debug(mouse1.log());
  const mouse2 = new Mouse(grid, start, headings[1]);
  // log.debug(mouse2.log());

  do {
    mouse1.step();
    // log.debug(mouse1.log());

    mouse2.step();
    // log.debug(mouse2.log());
  } while(!areCoordsEqual(mouse1.position, mouse2.position));

  return mouse1.stepCount;
}

function findStartingPointConnections(grid, point) {
  const [ s, w, e, n ] = orthogonal(point);

  const connections = [];

  if(n.x >= 0 && n.y >= 0 && [PIPES.NS, PIPES.SE, PIPES.SW].includes(grid[n.y][n.x])) { connections.push('N'); }
  if(s.x >= 0 && s.y >= 0 && [PIPES.NS, PIPES.NE, PIPES.NW].includes(grid[s.y][s.x])) { connections.push('S'); }
  if(e.x >= 0 && e.y >= 0 && [PIPES.EW, PIPES.NW, PIPES.SW].includes(grid[e.y][e.x])) { connections.push('E'); }
  if(w.x >= 0 && w.y >= 0 && [PIPES.EW, PIPES.NE, PIPES.SE].includes(grid[w.y][w.x])) { connections.push('W'); }

  return connections;
}

const PIPES = {
  START: 'S',
  NS: '|',
  EW: '-',
  NE: 'L',
  SE: 'F',
  SW: '7',
  NW: 'J',
  GROUND: '.',
};

export default { part1, part2 };
