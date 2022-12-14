import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { str2coords, coords2str } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const walls = parseInput(input);

  const settledGrains = runFallingSandSimulation(walls);

  return settledGrains;
}

async function* part2(input, options = {}) {
  const walls = parseInput(input);

  const settledGrains = runFallingSandSimulationWithFloor(walls);

  return settledGrains;
}

function parseInput(input) {
  return input.trim().split('\n').map(wall => wall.split(' -> ').map(str2coords));
}

const MATERIALS = {
  ROCK: '#',
  SAND: 'o',
  AIR:  '.',
};
function runFallingSandSimulation(walls, source = { x: 500, y: 0 }) {
  const occupiedSpaces = new Map();
  const abyssThreshold = Math.max(...walls.flat().map(coords => coords.y)) + 1;

  drawWalls(occupiedSpaces, walls);

  let grains = 0;
  while(true) {
    const sand = dropSand(occupiedSpaces, source, abyssThreshold);
    if(sand.y >= abyssThreshold) {
      break;
    } else {
      occupiedSpaces.set(coords2str(sand), MATERIALS.SAND);
      grains++;

      log.debug(grains + '\n' + formatFallingSand(occupiedSpaces));
    }
  }

  return grains;
}

function runFallingSandSimulationWithFloor(walls, source = { x: 500, y: 0 }, floorOffset = 1) {
  const occupiedSpaces = new Map();
  const floorY = Math.max(...walls.flat().map(coords => coords.y)) + 1;

  drawWalls(occupiedSpaces, walls);

  let grains = 0;
  while(true) {
    const sand = dropSand(occupiedSpaces, source, floorY);
    occupiedSpaces.set(coords2str(sand), MATERIALS.SAND);
    grains++;

    // log.debug(grains + '\n' + formatFallingSand(occupiedSpaces));

    if(sand.x === 500 && sand.y === 0) {
      break;
    }
  }

  return grains;
}

function drawWalls(occupiedSpaces, walls) {
  for(let wall of walls) {
    for(let i = 1; i < wall.length; ++i) {
      drawWallSide(occupiedSpaces, [wall[i - 1], wall[i]]);
    }
  }
}

function drawWallSide(occupiedSpaces, [start, end]) {
  [start, end] = [start, end].sort((a, b) => a.x - b.x || a.y - b.y);

  if(start.x === end.x) {
    // vertical wall
    const x = start.x;
    for(let y = start.y; y <= end.y; ++y) {
      occupiedSpaces.set(coords2str({x, y}), MATERIALS.ROCK);
    }
  } else {
    // horizontal wall
    const y = start.y;
    for(let x = start.x; x <= end.x; ++x) {
      occupiedSpaces.set(coords2str({x, y}), MATERIALS.ROCK);
    }
  }
}

function dropSand(occupiedSpaces, source, abyssThreshold) {
  const sand = { ...source };

  while(sand.y < abyssThreshold) {
    // can it drop straight down?
    if(!occupiedSpaces.has(coords2str({ x: sand.x, y: sand.y + 1}))) {
      sand.y += 1;
      continue;
    }

    // can it go down and to the left?
    if(!occupiedSpaces.has(coords2str({ x: sand.x - 1, y: sand.y + 1}))) {
      sand.y += 1;
      sand.x -= 1;
      continue;
    }

    // can it go down and to the right?
    if(!occupiedSpaces.has(coords2str({ x: sand.x + 1, y: sand.y + 1}))) {
      sand.y += 1;
      sand.x += 1;
      continue;
    }

    // the sand has nowhere to go and settles
    break;
  }

  return sand;
}

function formatFallingSand(occupiedSpaces) {
  const coordsWithStuff = [...occupiedSpaces.keys()].map(str2coords);
  const minX = Math.min(...coordsWithStuff.map(coords => coords.x));
  const maxX = Math.max(...coordsWithStuff.map(coords => coords.x));
  const maxY = Math.max(...coordsWithStuff.map(coords => coords.y));

  const out = [];
  for(let y = 0; y <= maxY; ++y) {
    out.push([]);
    for(let x = minX; x <= maxX; ++x) {
      const char = occupiedSpaces.get(coords2str({ x, y })) || MATERIALS.AIR;
      out[y].push(char);
    }
  }

  return out.map(line => line.join('')).join('\n');
}

export default { part1, part2 };
