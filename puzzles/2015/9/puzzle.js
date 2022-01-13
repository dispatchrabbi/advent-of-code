import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

async function part1(input) {
  const edges = parseInput(input);

  const graph = new Graph(edges);
  const { path, distance } = graph.findExtremePath(true);
  log.info({path, distance});

  return distance;
}

async function part2(input) {
  const edges = parseInput(input);

  const graph = new Graph(edges);
  const { path, distance } = graph.findExtremePath(false);
  log.info({path, distance});

  return distance;
}

function parseInput(input) {
  const lines = input.trim().split('\n');
  const edges = lines.map(line => {
    const [ edge, distance ] = line.split(' = ');
    const endpoints = edge.split(' to ');

    return {
      from: endpoints[0],
      to: endpoints[1],
      distance: +distance,
    };
  });

  return edges;
}

class Graph {
  constructor(edges) {
    this.edges = edges;

    this.nodes = new Set();
    edges.forEach(edge => { this.nodes.add(edge.from); this.nodes.add(edge.to); });
  }

  findExtremePath(minimize = true, startWith = null) {
    if(this.edges.length === 1) {
      if(this.edges[0].from === startWith) {
        return { path: [ this.edges[0].from, this.edges[0].to ], distance: this.edges[0].distance };
      } else {
        return { path: [ this.edges[0].to, this.edges[0].from ], distance: this.edges[0].distance };
      }
    }

    let bestDistanceSoFar = Infinity * (minimize ? 1 : -1);
    let bestPathSoFar = null;

    const edgesBothWays = [
      ...this.edges,
      ...this.edges.map(edge => ({ from: edge.to, to: edge.from, distance: edge.distance })),
    ].filter(edge => startWith ? edge.from === startWith : true);

    for(let startingEdge of edgesBothWays) {
      const path = [ startingEdge.from ];
      let distance = startingEdge.distance;

      const subEdges = this.edges.filter(edge => edge.from !== startingEdge.from && edge.to !== startingEdge.from);
      const subGraph = new Graph(subEdges);
      const { path: subPath, distance: subDistance } = subGraph.findExtremePath(minimize, startingEdge.to);

      path.push(...subPath);
      distance += subDistance;

      if(distance === Math[minimize ? 'min' : 'max'](distance, bestDistanceSoFar)) {
        bestDistanceSoFar = distance;
        bestPathSoFar = path;
      }
    }

    return {
      path: bestPathSoFar,
      distance: bestDistanceSoFar
    };
  }
}

export default { part1, part2 };
