import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { mod, lcm } from '#utils/maths';
import { GridMap, orthogonal, areCoordsEqual, coords2str } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { height, width, blizzards } = parseInput(input);

  const shortestPathThroughTheBlizzards = findAPathThroughTheBlizzards(blizzards, { width, height });

  return shortestPathThroughTheBlizzards.minute;
}

async function* part2(input, options = {}) {
  const { height, width, blizzards } = parseInput(input);

  const start = { x: 0, y: -1 };
  const end = { x: width - 1, y: height };

  const there = findAPathThroughTheBlizzards(blizzards, { width, height }, start, end, 0);
  const back = findAPathThroughTheBlizzards(blizzards, { width, height }, end, start, there.minute);
  const thereAgain = findAPathThroughTheBlizzards(blizzards, { width, height }, start, end, there.minute + back.minute);

  const totalTrip = there.minute + back.minute + thereAgain.minute;
  // log.debug(there.minute, back.minute, thereAgain.minute, totalTrip);
  return totalTrip;
}

const CARET_DIRECTIONS = {
  '^': { x:  0, y: -1 },
  'v': { x:  0, y:  1 },
  '<': { x: -1, y:  0 },
  '>': { x:  1, y:  0 },
};

function parseInput(input) {
  const lines = input.trimEnd().split('\n');

  const blizzards = [];
  for(let y = 1; y < lines.length - 1; ++y) {
    for(let x = 1; x < lines[y].length - 1; ++x) {
      const char = lines[y][x];
      if(char !== '.') {
        blizzards.push({ position: { x: x - 1, y: y - 1 }, heading: char });
      }
    }
  }

  return { height: lines.length - 2, width: lines[0].length - 2, blizzards };
}

function findAPathThroughTheBlizzards(blizzards, { height, width }, start = { x: 0, y: -1 }, end = { x: width - 1, y: height }, startingMinuteOffset = 0) {
  const radarCycle = getRadarCycle(blizzards, { height, width });

  // I think BFS is probably going to be the best here, it'll get us the minimum quickly
  const seen = new Set();
  const states = [ { position: start, minute: 0, history: [], } ];
  let lowestSoFar = { minute: Infinity };
  while(states.length > 0) {
    const state = states.shift();

    const stateKey = getStateKey(state, radarCycle.length);
    if(seen.has(stateKey)) {
      continue;
    }

    const nextMinute = state.minute + 1;
    if(nextMinute > lowestSoFar.minute) {
      // this branch isn't the shortest one
      continue;
    }

    const freeSpots = radarCycle[(nextMinute + startingMinuteOffset) % radarCycle.length].free;
    let nextMoves = orthogonal(state.position).concat([ state.position ])
      .filter(pos => areCoordsEqual(pos, start) || areCoordsEqual(pos, end) || freeSpots.has(pos));

    for(let nextPosition of nextMoves) {
      const nextState = { position: nextPosition, minute: nextMinute, history: state.history.concat([ state ]) };
      if(areCoordsEqual(nextState.position, end)) {
        // log.debug(`Found one! At ${nextMinute}`);
        if(nextState.minute < lowestSoFar.minute) {
          lowestSoFar = nextState;
        }
      } else {
        states.push(nextState);
      }
    }

    seen.add(stateKey);
  }

  log.debug(lowestSoFar.minute, lowestSoFar.history.map(s => coords2str(s.position)).join(' -> '));
  return lowestSoFar;
}

function getStateKey({ position, minute }, cycleLength) {
  return position.x + ',' + position.y + ':' + (minute % cycleLength);
}

function getRadarCycle(blizzards, { height, width }) {
  const radarCycle = [];

  const cycleLength = lcm(height, width);
  for(let i = 0; i < cycleLength; ++i) {
    // scan for free spaces
    radarCycle.push(radarScan(blizzards, { width, height }));

    // advance all the blizzards
    for(let blizzard of blizzards) {
      blizzard.position = {
        x: mod(blizzard.position.x + CARET_DIRECTIONS[blizzard.heading].x, width),
        y: mod(blizzard.position.y + CARET_DIRECTIONS[blizzard.heading].y, height),
      };
    }
  }

  return radarCycle;
}

function radarScan(blizzards, { width, height }) {
  const blizzardSpaces = new GridMap();

  for(let blizzard of blizzards){
    blizzardSpaces.increment(blizzard.position);
  }

  const freeSpaces = new GridMap();
  for(let y = 0; y < height; ++y) {
    for(let x = 0; x < width; ++x) {
      if(!blizzardSpaces.has({x, y})) {
        freeSpaces.increment({x, y});
      }
    }
  }

  return {
    blizzards: blizzardSpaces,
    free: freeSpaces
  };
}

function formatRadar(radar, { width, height }, person = { x: Infinity, y: Infinity }) {
  let out = '\n';
  for(let y = -1; y <= height; ++y) {
    for(let x = -1; x <= width; ++x) {
      if(x === person.x && y === person.y) {
        out += chalk.magenta('!');
      } else if(x < 0 || x >= width || y < 0 || y >= height) {
        out += '#';
      } else if(radar.free.has({x, y})) {
        out += chalk.gray('.');
      } else if(radar.blizzards.has({x, y})) {
        out += chalk.cyan(radar.blizzards.get({x, y}));
      }
    }
    out += '\n';
  }

  return out;
}

export default { part1, part2 };
