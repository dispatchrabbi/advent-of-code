import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import delay from '#lib/delay';
import { draw2dArray } from '#utils/dots';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { steps: 100 }) {
  let grid = parseInput(input);
  yield frame(formatGrid(grid), `Input`);

  for(let i = 1; i <= options.steps; ++i) {
    grid = step(grid);
    yield frame(formatGrid(grid), `Step ${i}`);
  }

  return grid.reduce((total, row) => total + row.reduce((total, cell) => total + (cell ? 1 : 0), 0), 0);
}

async function* part2(input, options = { steps: 100 }) {
  let grid = parseInput(input);
  turnOnStuckLights(grid);
  yield frame(formatGrid(grid), `Input`);

  for(let i = 1; i <= options.steps; ++i) {
    grid = step(grid);
    turnOnStuckLights(grid);
    yield frame(formatGrid(grid), `Step ${i}`);
  }

  return grid.reduce((total, row) => total + row.reduce((total, cell) => total + (cell ? 1 : 0), 0), 0);
}

function parseInput(input) {
  return input.trim().split('\n').map(row => row.split('').map(el => el === '#'));
}

function step(grid) {
  return grid.map((row, y) => {
    return row.map((cell, x) => {
      const neighborsLit = getNeighbors(grid, { x, y }).filter(state => state === true).length;
      if(cell) {
        return (neighborsLit === 2 || neighborsLit === 3);
      } else {
        return neighborsLit === 3;
      }
    });
  });
}

function turnOnStuckLights(grid) {
  // turn on the four corners
  grid[0][0] = true;
  grid[0][grid[0].length - 1] = true;
  grid[grid.length - 1][0] = true;
  grid[grid.length - 1][grid[grid.length - 1].length - 1] = true;
}

function getNeighbors(grid, { x, y }) {
  function getCell(x, y) {
    if(x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
      return false;
    }

    return grid[y][x];
  }

  return [
    getCell(x-1, y-1), getCell(x, y-1), getCell(x+1, y-1),
    getCell(x-1, y  ),                  getCell(x+1, y  ),
    getCell(x-1, y+1), getCell(x, y+1), getCell(x+1, y+1),
  ];
}

function formatGrid(grid) {
  return draw2dArray(grid);
}

export default { part1, part2 };
