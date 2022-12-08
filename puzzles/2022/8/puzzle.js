import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';
import { transpose } from '#utils/arr';
import { coords2str } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const treeGrid = parseInput(input);

  const visibleTrees = findVisibleTrees(treeGrid);

  log.debug('\n' + formatTreeGrid(treeGrid, visibleTrees));

  const visibleSet = new Set(Object.values(visibleTrees).flat().map(coords2str));
  return visibleSet.size;
}

async function* part2(input, options = {}) {
  const treeGrid = parseInput(input);

  const scoreGrid = calculateScenicScoresForTreeGrid(treeGrid);
  const mostScenicTreeScore = scoreGrid.flat().reduce((max, val) => val > max ? val : max, -Infinity);

  return mostScenicTreeScore;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split('').map(x => +x));
}

function findVisibleTrees(treeGrid) {
  const visibleTrees = {
    left: [],
    right: [],
    top: [],
    bottom: [],
  };

  for(let row = 0; row < treeGrid.length; ++row) {
    const left = findVisibleTreesInRow(treeGrid[row]).map(col => ({x: col, y: row}));
    const right = findVisibleTreesInRow(Array.from(treeGrid[row]).reverse()).map(col => ({x: treeGrid[row].length - col - 1, y: row}));
    visibleTrees.left.push(...left);
    visibleTrees.right.push(...right);
  }

  const transposedTreeGrid = transpose(treeGrid);
  for(let row = 0; row < transposedTreeGrid.length; ++row) {
    const top = findVisibleTreesInRow(transposedTreeGrid[row]).map(col => ({x: row, y: col}));
    const bottom = findVisibleTreesInRow(Array.from(transposedTreeGrid[row]).reverse()).map(col => ({x: row, y: treeGrid[row].length - col - 1}))
    visibleTrees.top.push(...top);
    visibleTrees.bottom.push(...bottom);
  }

  return visibleTrees;
}

function findVisibleTreesInRow(treeRow) {
  const visibleTrees = [];
  let max = -Infinity;

  for(let i = 0; i < treeRow.length; ++i) {
    if(treeRow[i] > max) {
      visibleTrees.push(i);
      max = treeRow[i];
    }
  }

  return visibleTrees;
}

function calculateScenicScoresForTreeGrid(treeGrid) {
  const transposedTreeGrid = transpose(treeGrid);

  return treeGrid.map((rowArr, row) => rowArr.map((colArr, col) => {
    const left = calculateScenicScoreForRow(treeGrid[row].slice(0, col).reverse(), treeGrid[row][col]);
    const right = calculateScenicScoreForRow(treeGrid[row].slice(col + 1), treeGrid[row][col]);
    const top = calculateScenicScoreForRow(transposedTreeGrid[col].slice(0, row).reverse(), treeGrid[row][col]);
    const bottom = calculateScenicScoreForRow(transposedTreeGrid[col].slice(row + 1), treeGrid[row][col]);

    return left * right * top * bottom;
  }));
}

function calculateScenicScoreForRow(row, treehouseHeight) {
  for(let i = 0; i < row.length; ++i) {
    if(row[i] >= treehouseHeight) { return i + 1; }
  }
  return row.length;
}

function formatTreeGrid(treeGrid, highlighted) {
  const highlightedSet = new Set(Object.values(highlighted).flat().map(coords2str));

  return treeGrid.map((row, y) => row.map((tree, x) => highlightedSet.has(coords2str({x, y})) ? chalk.green(tree) : tree).join('')).join('\n');
}

export default { part1, part2 };
