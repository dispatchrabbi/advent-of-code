import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { GridMap } from '#utils/grid';
import { gcd } from '#utils/maths';
import { uniquify } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const asteroids = parseInput(input);

  const winner = findBestMonitoringStationLocation(asteroids);

  log.debug(winner);
  return winner.seen;
}

async function* part2(input, options = { x: 20, y: 21 }) {
  const asteroids = parseInput(input);

  const destroyed = destroyAllAsteroids(asteroids, options);

  const asteroid200 = destroyed[199];
  log.debug(asteroid200, destroyed.length);
  return asteroid200.x * 100 + asteroid200.y;
}

function parseInput(input) {
  return input.trimEnd().split('\n').map(line => line.split('').map(el => el === '#'));
}

function findBestMonitoringStationLocation(asteroids) {
  const winner = {
    location: null,
    seen: 0,
  };

  const vectors = findAllVectors(asteroids);

  for(let y = 0; y < asteroids.length; ++y) {
    for(let x = 0; x < asteroids[y].length; ++x) {
      if(!asteroids[y][x]) { continue; }

      const seen = _calculateNumberOfAsteroidsSeen(asteroids, { x, y }, vectors);
      if(seen > winner.seen) {
        winner.seen = seen;
        winner.location = { x, y };
      }
    }
  }

  return winner;
}

function _calculateNumberOfAsteroidsSeen(asteroids, { x, y }, vectors) {
  // log.debug(`Calculating asteroids for (${x}, ${y}):`);
  let seen = 0;

  for(let vector of vectors) {
    const result = _findNextAsteroidOnVector(asteroids, { x, y }, vector);
    if(result) {
      seen++;
    }
  }

  return seen;
}

function _findNextAsteroidOnVector(asteroids, { x, y }, vector) {
  for(let k = 1; true; k++) {
    const target = { x: x + (k * vector.x), y: y + (k * vector.y) };

    if(target.x < 0 || target.y < 0 || target.x >= asteroids[0].length || target.y >= asteroids.length) {
      // k is too large, we're outside of the asteroid field
      return null;
    } else if(asteroids[target.y][target.x]) {
      return { x: target.x, y: target.y };
    }
  }
}

function findAllVectors(asteroids) {
  const width = asteroids[0].length - 1;
  const height = asteroids.length - 1;

  const vectorsCollected = new GridMap();

  // enumerate all the slopes possible in quadrant 1
  for(let x = 0; x <= width; ++x) {
    for(let y = 0; y <= height; ++y) {
      if(x === 0 && y === 0) {
        continue;
      } else if(x === 0) {
        vectorsCollected.increment({ x: 0, y: 1});
      } else if(y === 0) {
        vectorsCollected.increment({ x: 1, y: 0 });
      } else {
        const divisor = gcd(x, y);
        vectorsCollected.increment({ x: x / divisor, y: y / divisor });
      }
    }
  }

  const quadrant1Slopes = vectorsCollected.keys();

  return uniquify([
    ...quadrant1Slopes,                                        // Quadrant I
    ...quadrant1Slopes.map(({ x, y }) => ({ x: -y, y: x })),   // Quadrant II
    ...quadrant1Slopes.map(({ x, y }) => ({ x: -x, y: -y })),  // Quadrant III
    ...quadrant1Slopes.map(({ x, y }) => ({ x: y, y: -x })),   // Quadrant IV
  ], (a, b) => a.x === b.x && a.y === b.y);
}

function orderVectorsClockwise(vectors) {
  const PI_OVER_TWO = Math.PI / 2;
  const sorted = vectors.sort((a, b) => {
    let alpha = Math.atan2(-a.y, a.x);
    if(alpha > PI_OVER_TWO) { alpha -= 2 * Math.PI; }

    let beta = Math.atan2(-b.y, b.x);
    if(beta > PI_OVER_TWO) { beta -= 2 * Math.PI; }

    return beta - alpha;
  });

  return sorted;
}

function destroyAllAsteroids(asteroids, { x, y }) {
  const vectors = orderVectorsClockwise(findAllVectors(asteroids));

  const amountToDestroy = asteroids.reduce((sum, row) => sum + row.filter(el => el).length, 0) - 1; // -1 because we don't destroy the one we're on
  const destroyed = [];
  let vectorIx = 0;
  while(destroyed.length < amountToDestroy) {
    const result = _findNextAsteroidOnVector(asteroids, { x, y }, vectors[vectorIx]);
    if(result) {
      asteroids[result.y][result.x] = false;
      destroyed.push(result);
    }

    vectorIx = (vectorIx + 1) % vectors.length;
  }

  return destroyed;
}

export default { part1, part2 };
