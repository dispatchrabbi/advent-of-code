import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Graph, GraphNode } from '#utils/graph';
import { combine, permute, uniquify } from '#utils/arr';

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

  const totalPressure = findOptimalPressureReleaseWithAnElephant(caveGraph);
  return totalPressure;

  // const totalPressure = findOptimalPressureReleaseWithAnElephant2(caveGraph);
  // return totalPressure;
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

const memo = new Map();
const hashState = state => ([
  state.minutesLeft,
  state.openValves.sort().join(','),
  state.totalFlowRate,
  state.human.id,
  state.elephant.id,
].join(':'));

function findOptimalPressureReleaseWithAnElephant(connectedGraph, startNode = connectedGraph.getNode('AA')) {
  const valvesToVisit = connectedGraph.nodes.filter(node => node.id !== startNode.id);
  const valveCombinations = combine(valvesToVisit);

  let maxSoFar = -Infinity;
  for(let humanValves of valveCombinations) {
    const elephantValves = valvesToVisit.filter(v => !humanValves.includes(v));

    const humanRelease = findOptimalPressureRelease(26, connectedGraph, startNode, humanValves);
    const elephantRelease = findOptimalPressureRelease(26, connectedGraph, startNode, elephantValves);

    if(humanRelease + elephantRelease > maxSoFar) {
      // log.debug(`${maxSoFar} < ${humanRelease + elephantRelease}: ${humanRelease} (${humanValves.map(n => n.id)}) + ${elephantRelease} (${elephantValves.map(n => n.id)})`);
      maxSoFar = humanRelease + elephantRelease;
    }
  }

  return maxSoFar;
}

function findOptimalPressureReleaseWithAnElephant2(graph) {
  let totalPressureReleased = 0;

  let minutesLeft = 26;
  const openValves = [];
  let totalFlowRate = 0;

  let human = graph.getNode('AA');
  let elephant = graph.getNode('AA');

  while(minutesLeft > 0) {
    log.debug(`== Minute ${27 - minutesLeft} ==`);
    log.debug(`Valves [${openValves.join(', ')}] are open, releasing ${totalFlowRate} pressure.`);
    totalPressureReleased += totalFlowRate;

    // figure out the next move for the human and elephant
    const humanOptions = getRankedBestNextValves(graph, minutesLeft, openValves, human);
    const elephantOptions = getRankedBestNextValves(graph, minutesLeft, openValves, elephant);
    let nextHumanValve = humanOptions[0];
    let nextElephantValve = elephantOptions[0];
    if(nextHumanValve && nextElephantValve && nextHumanValve.valve === nextElephantValve.valve) {
      if(nextElephantValve.value > nextHumanValve.value) {
        nextHumanValve = humanOptions[1];
      } else if(nextElephantValve.value < nextHumanValve.value) {
        nextElephantValve = elephantOptions[1];
      } else if(nextElephantValve.value === nextHumanValve.value) {
        if(elephantOptions[1] && humanOptions[1] && elephantOptions[1].value > humanOptions[1].value) {
          nextElephantValve = elephantOptions[1];
        } else {
          nextHumanValve = humanOptions[1];
        }
      }
    }

    if(nextHumanValve) {
      if(nextHumanValve.valve === human) {
        // open the valve
        log.debug(`Human opens valve ${human.id}.`);
        openValves.push(human.id);
        totalFlowRate += human.data.flowRate;
      } else {
        // move the human
        log.debug(humanOptions.map(o => ({ id: o.valve.id, value: o.value, next: o.path[1]?.id })));
        log.debug(`Human moves to ${nextHumanValve.path[1].id}.`);
        human = nextHumanValve.path[1];
      }
    } // else don't move at all

    if(nextElephantValve) {
      if(nextElephantValve.valve === elephant) {
        // open the valve
        log.debug(`Elephant opens valve ${elephant.id}.`);
        openValves.push(elephant.id);
        totalFlowRate += elephant.data.flowRate;
      } else {
        // move the elephant
        log.debug(elephantOptions.map(o => ({ id: o.valve.id, value: o.value, next: o.path[1]?.id })));
        log.debug(`Elephant moves to ${nextElephantValve.path[1].id}.`);
        elephant = nextElephantValve.path[1];
      }
    } // else don't move at all

    log.debug('\n');
    minutesLeft--;
  }

  return totalPressureReleased;
}

function getRankedBestNextValves(graph, minutesLeft, openValves, currentNode) {
  const valvesToOpen = graph.nodes
    .filter(n => n.data.flowRate > 0 && !openValves.includes(n.id))
    .map(valve => {
      const { path, cost } = graph.dijkstra(node => node === valve, currentNode);
      return {
        valve,
        path,
        cost,
        value: valve.data.flowRate * (minutesLeft - (cost + 1)),
      };
    })
    .filter(v => (v.cost + 1) < minutesLeft);

  const sortedValvesToOpen = valvesToOpen.sort((a, b) => b.value - a.value);

  return sortedValvesToOpen;
}

function getPathToBestNextValve(graph, minutesLeft, openValves, currentNode, rank = 0) {
  // log.debug('== getPath: ', minutesLeft, ' ==');
  const paths = graph.nodes
    .filter(n => n.data.flowRate > 0 && !openValves.includes(n.id))
    .map(valve => {
      const { path, cost } = graph.dijkstra(node => node === valve, currentNode);
      return { id: valve.id, flowRate: valve.data.flowRate, cost, path };
    })
    .sort((a, b) => {
      const aRank = a.flowRate * (minutesLeft - (a.cost + 1));
      const bRank = b.flowRate * (minutesLeft - (b.cost + 1));
      // log.debug('a: ', a.id, aRank, a.flowRate, a.cost, a.path.map(n => n.id).join(','));
      // log.debug('b: ', b.id, bRank, b.flowRate, b.cost, b.path.map(n => n.id).join(','));
      // log.debug(bRank > aRank ? b.id : aRank > bRank ? a.id : 'tie');
      return bRank > aRank ? 1 : aRank > bRank ? -1 : (a.flowRate - b.flowRate);
    });

    log.debug(`== getPath from ${currentNode.id} @ ${minutesLeft} ==`);
    paths.forEach(path => log.debug(`${path.id}: ${path.flowRate * (minutesLeft - path.cost + 1)}`));
    log.debug('');

    return paths[rank];
}

export default { part1, part2 };
