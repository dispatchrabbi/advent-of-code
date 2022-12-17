import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Graph, GraphNode } from '#utils/graph';
import { pairs } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const valves = parseInput(input);

  const caveGraph = buildCaveGraph(valves);
  connectRoomsWithValves(caveGraph, caveGraph.getNode('AA'));

  const optimalPressureRelease = findOptimalPressureRelease(30, caveGraph, caveGraph.getNode('AA'));

  return optimalPressureRelease;
}

async function* part2(input, options = {}) {
  const valves = parseInput(input);

  const caveGraph = buildCaveGraph(valves);
  connectRoomsWithValves(caveGraph, caveGraph.getNode('AA'));

  const optimalPressureRelease = findOptimalPressureReleaseWithAnElephant(26, caveGraph, caveGraph.getNode('AA'));

  return optimalPressureRelease;
}

function parseInput(input) {
  const INPUT_REGEX = /^Valve ([A-Z]+) has flow rate=(\d+); tunnel[s]? lead[s]? to valve[s]? ([A-Z, ]+)$/;
  return input.trim().split('\n').map(line => {
    const matches = INPUT_REGEX.exec(line);
    return {
      id: matches[1],
      flowRate: +matches[2],
      tunnels: matches[3].split(', '),
    };
  });
}

function buildCaveGraph(valves) {
  const caveGraph = new Graph();

  for(let valve of valves) {
    const valveNode = new GraphNode(valve.id, { flowRate: valve.flowRate });
    caveGraph.addNode(valveNode);

    for(let neighborId of valve.tunnels) {
      let neighborNode = caveGraph.getNode(neighborId);
      if(neighborNode) {
        valveNode.addEdge(neighborNode);
        neighborNode.addEdge(valveNode);
      }
    }
  }

  return caveGraph;
}

function connectRoomsWithValves(graph, startNode) {
  const valves = graph.nodes.filter(node => node === startNode || node.data.flowRate > 0);

  // connect all the rooms with valves
  for(let i = 0; i < valves.length; ++i) {
    for(let j = i + 1; j < valves.length; ++j) {
      const { cost } = graph.dijkstra(n => n === valves[j], valves[i]);
      valves[i].addEdge(valves[j], cost + 1, { withOpen: true }); // +1 because it takes a minute to open the valve
      valves[j].addEdge(valves[i], cost + 1, { withOpen: true }); // +1 because it takes a minute to open the valve
    }
  }

  // remove the non-valve rooms
  for(let node of graph.nodes) {
    node._edges = node._edges.filter(edge => edge.metadata.withOpen === true);
    if(!valves.includes(node)) {
      graph._nodes.delete(node.id);
    }
  }
}

function findOptimalPressureRelease(minutesLeft, graph, startNode, valvesToVisit = null, depth = 0) {
  if(valvesToVisit === null) {
    valvesToVisit = graph.nodes.filter(node => node.id !== startNode.id);
  }

  const valvesAndCosts = valvesToVisit.map(node => ({
    id: node.id,
    cost: startNode.edges.find(e => e.neighbor.id === node.id).cost,
  })).filter(({ cost }) => cost < minutesLeft);

  let optimalPressureRelease = 0;
  if(valvesAndCosts.length > 0) {
    const pressureReleaseCounts = valvesAndCosts.map(({id, cost}) => {
      return findOptimalPressureRelease(
        minutesLeft - cost,
        graph,
        graph.getNode(id),
        valvesToVisit.filter(n => n.id !== id),
        depth + 1
      );
    });

    optimalPressureRelease = pressureReleaseCounts.sort((a, b) => b - a)[0];
  }

  return (startNode.data.flowRate * minutesLeft) + optimalPressureRelease;
}

function findOptimalPressureReleaseWithAnElephant(minutesLeft, graph, startNode, valvesToVisit = null, depth = 0) {
  if(valvesToVisit === null) {
    valvesToVisit = graph.nodes.filter(node => node.id !== startNode.id);
  }

  log.debug(' '.repeat(depth * 2), startNode.id, valvesToVisit.map(n => n.id));

  const valvesAndCosts = valvesToVisit.map(node => ({
    id: node.id,
    cost: startNode.edges.find(e => e.neighbor.id === node.id).cost,
  })).filter(({ cost }) => cost < minutesLeft);

  let optimalPressureRelease = 0;
  if(valvesAndCosts.length >= 2) {
    const optimalPressureReleaseObj = pairs(valvesAndCosts).map(([vc1, vc2]) => {
      const release1 = findOptimalPressureReleaseWithAnElephant(
        minutesLeft - vc1.cost,
        graph,
        graph.getNode(vc1.id),
        valvesToVisit.filter(v => v.id !== vc1.id && v.id !== vc2.id),
        depth + 1
      );

      const release2 = findOptimalPressureReleaseWithAnElephant(
        minutesLeft - vc2.cost,
        graph,
        graph.getNode(vc2.id),
        valvesToVisit.filter(v => v.id !== vc1.id && v.id !== vc2.id),
        depth + 1
      );

      return { nodes: [ vc1.id, vc2.id ], release: release1 + release2 };
    }).sort((a, b) => b.release - a.release)[0];
    optimalPressureRelease = optimalPressureReleaseObj.release;
  } else if(valvesAndCosts.length === 1) {
    const { id: nextId, cost: nextCost } = valvesAndCosts[0];
    optimalPressureRelease = findOptimalPressureReleaseWithAnElephant(
      minutesLeft - nextCost,
      graph,
      graph.getNode(nextId),
      [],
      depth + 1
    );
  }

  return (startNode.data.flowRate * minutesLeft) + optimalPressureRelease;
}

export default { part1, part2 };
