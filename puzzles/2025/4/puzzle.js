import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { adjacent } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const chart = parseInput(input);

  const accessibleRolls = findAccessibleRolls(chart);

  return accessibleRolls.length;
}

async function* part2(input, options = {}) {
  const chart = parseInput(input);

  let totalCount = 0;
  while(true) {
    const accessibleRolls = findAccessibleRolls(chart);
    if(accessibleRolls.length === 0) {
      break;
    }
    totalCount += accessibleRolls.length;
    
    for(const roll of accessibleRolls) {
      chart[roll.y][roll.x] = '.';
    }
  }

  return totalCount;
}

function parseInput(input) {
  return input.trimEnd().split('\n').map(line => line.split(''));
}

function findAccessibleRolls(chart) {
  const accessibleRolls = [];

  for(let y = 0; y < chart.length; ++y) {
    for(let x = 0; x < chart[y].length; ++x) {
      if(chart[y][x] === '@' && isRollAccessible(chart, x, y)) {
        accessibleRolls.push({x, y});
      }
    }
  }

  return accessibleRolls;
}

function isRollAccessible(chart, x, y) {
  const adjacentRollCoords = adjacent({x, y}).filter(point => (
    point.y >= 0 && point.y < chart.length &&
    point.x >= 0 && point.x < chart[0].length
  ));
  
  let rolls = 0;
  for(const coords of adjacentRollCoords) {
    if(chart[coords.y][coords.x] === '@') {
      rolls++;
    }

    if(rolls >= 4) {
      return false;
    }
  }

  return true;
}

export default { part1, part2 };
