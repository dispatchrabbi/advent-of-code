import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { createEmptyGraph, addNode, addEdge, type Graph, type GraphNode, type GraphEdge } from '#utils/graph-utils';
import { product } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input: string, options = { connections: 1000 }) {
  const points = parseInput(input);
  
  const graph = createGraph(points);
  connectShortestPoints(graph, options.connections);

  const circuitsInfo = findTopCircuits(graph);
  const result = circuitsInfo.circuits[0].nodes.length * circuitsInfo.circuits[1].nodes.length * circuitsInfo.circuits[2].nodes.length;

  return result;
}

async function* part2(input: string, options = {}) {
  const points = parseInput(input);
  
  const graph = createGraph(points);
  const lastEdge = connectAllPoints(graph);

  const result = product(lastEdge.nodes.values().map(node => node.data.point[0]));

  return result;
}

type Point = [number, number, number];

function parseInput(input: string) {
  return input.trimEnd().split('\n').map(line => line.split(',').map(x => +x)) as Point[];
}

type CeilingGraphNodeData = { point: Point, circuit: number | null };
type CeilingGraph = Graph<CeilingGraphNodeData, null>
function createGraph(points: Point[]): CeilingGraph {
  const graph: CeilingGraph = createEmptyGraph();

  for(const point of points) {
    const pointNode = addNode(graph, { point, circuit: null});
    
    for(const node of graph.nodes) {
      if(node !== pointNode) {
        addEdge(graph, [node, pointNode], distance3d(node.data.point, pointNode.data.point), null);
      }
    }
  }

  return graph;
}

function distance3d(a: Point, b: Point) {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
}

function connectShortestPoints(graph: CeilingGraph, connections: number) {
  const sortedEdges = graph.edges.sort((a, b) => a.distance - b.distance);
  
  for(let i = 0; i < connections; ++i) {
    const nextShortestEdge = sortedEdges[i];
    hookUpEdge(graph, nextShortestEdge, i);
  }
}

function connectAllPoints(graph: CeilingGraph): GraphEdge<null, CeilingGraphNodeData> {
  const sortedEdges = graph.edges.sort((a, b) => a.distance - b.distance);

  let i: number;
  for(i = 0; i < sortedEdges.length; ++i) {
    const nodesInCircuit = hookUpEdge(graph, sortedEdges[i], i);
    if(nodesInCircuit >= graph.nodes.length) {
      break;
    }
  }

  return sortedEdges[i];
}

function hookUpEdge(graph: CeilingGraph, edge: GraphEdge<null, CeilingGraphNodeData>, circuitId: number): number {
  let nodesInCircuit = 0;
  
  const circuitIdsToChange = Array.from(edge.nodes.values().map(node => node.data.circuit).filter(c => c !== null));
  for(const node of graph.nodes) {
    // change all the nodes on this edge and anything connected to them
    if(circuitIdsToChange.includes(node.data.circuit ?? -1) || edge.nodes.has(node)) {
      node.data.circuit = circuitId;
      nodesInCircuit++;
    }
  }

  return nodesInCircuit;
}

type CircuitInfo = {
  circuits: { circuit: number | null, nodes: GraphNode<CeilingGraphNodeData>[] }[];
  unconnectedNodes: GraphNode<CeilingGraphNodeData>[];
}
function findTopCircuits(graph: CeilingGraph): CircuitInfo {
  const grouped = Object.groupBy(graph.nodes, node => node.data.circuit ?? -1);
  
  const circuits = Object.entries(grouped)
    .filter(([circuit, _nodes]) => circuit !== '-1')
    .map(([circuit, nodes]) => ({
      circuit: +circuit,
      nodes: nodes ?? [],
    }))
    .sort((a, b) => b.nodes.length - a.nodes.length);
  
  const unconnectedNodes = grouped['-1'] ?? [];

  return {
    circuits,
    unconnectedNodes,
  };
}

// function fmtEdge(edge: GraphEdge<null, CeilingGraphNodeData>) {
//   return Array.from(edge.nodes.values().map(fmtNode)).join(' ') + ` (${edge.distance})`;
// }

// function fmtNode(node: GraphNode<CeilingGraphNodeData>) {
//   return `${node.data.point} (${node.data.circuit})`;
// }

export default { part1, part2 };
