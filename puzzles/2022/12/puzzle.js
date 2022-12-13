import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { orthogonal } from '#utils/grid';
import { Graph, GraphNode } from '#utils/graph';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { grid, start, end } = parseInput(input);

  const mapGraph = grid2graph(grid, start);
  const { cost } = mapGraph.dijkstra(node => node._data.x === end.x && node._data.y === end.y);

  return cost;
}

async function* part2(input, options = {}) {
  const { grid, start, end } = parseInput(input);

  const mapGraph = grid2graph(grid, start);
  const elevationANodes = [ ...mapGraph._nodes.values() ].filter(node => node._data.height === 0);
  log.debug(elevationANodes.length);

  const shortestPathFromElevationA = elevationANodes
    .map(aNode => mapGraph.dijkstra(node => node._data.x === end.x && node._data.y === end.y, aNode))
    .reduce((min, { cost }) => cost < min ? cost : min, Infinity);

  return shortestPathFromElevationA;
}

function parseInput(input) {
  let start, end;
  let grid = input.trim().split('\n').map((line, row) => line.split('').map((char, col) => {
    if(char === 'S') { start = { x: col, y: row }; }
    if(char === 'E') { end = { x: col, y: row }; }
    return char2height(char);
  }));

  return {
    grid,
    start,
    end
  };
}

const ASCII_LOWERCASE_A = 'a'.charCodeAt(0);
function char2height(char) {
  if(char === 'S') { char = 'a'; }
  if(char === 'E') { char = 'z'; }

  return char.charCodeAt(0) - ASCII_LOWERCASE_A;
}

function grid2graph(grid, start) {
  const nodes = grid.map((row, y) => row.map((height, x) => new GraphNode({ x, y, height }))).flat();

  const gridHeight = grid.length, gridWidth = grid[0].length;
  nodes.forEach(center => {
    const steppableNeighbors = orthogonal({ x: center._data.x, y: center._data.y })
      .filter(({ x, y }) => (
        x >= 0 && x < gridWidth &&
        y >= 0 && y < gridHeight &&
        grid[y][x] <= (center._data.height + 1)
      ))
      .map(({x, y}) => nodes.find(node => node._data.x === x && node._data.y === y));

    for(let neighbor of steppableNeighbors) {
      center.addEdge(neighbor, 1);
    }
  });

  const root = nodes.find(node => node._data.x === start.x && node._data.y === start.y);

  const mapGraph = new Graph(root);
  for(let node of nodes) {
    mapGraph.addNode(node);
  }

  return mapGraph;
}

export default { part1, part2 };
