import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const components = parseInput(input);

  const bridges = findAllBridges(0, components);

  const strongestBridgeStrength = bridges.reduce((max, bridge) => calculateBridgeStrength(bridge) > max ? calculateBridgeStrength(bridge) : max, -Infinity);
  return strongestBridgeStrength;
}

async function* part2(input, options = {}) {
  const components = parseInput(input);

  const bridges = findAllBridges(0, components);
  const longestBridgeLength = bridges.reduce((max, bridge) => bridge.length > max ? bridge.length : max, -Infinity);

  const longestBridges = bridges.filter(bridge => bridge.length === longestBridgeLength);
  const strongestLongestBridgeStrength = longestBridges.reduce((max, bridge) => calculateBridgeStrength(bridge) > max ? calculateBridgeStrength(bridge) : max, -Infinity);

  return strongestLongestBridgeStrength;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split('/').map(x => +x));
}

function calculateBridgeStrength(components) {
  return sum(components.flat());
}

function findAllBridges(openPort, components, depth = 0) {
  // log.debug(' '.repeat(depth * 2) + 'findAllBridges', depth, openPort, components.length);
  const bridges = [];
  const nextLinks = componentsWithPort(openPort, components);
  for(let link of nextLinks) {
    const leftovers = components.filter(c => c !== link);
    const loosePort = otherPort(link, openPort);

    if(leftovers.some(c => c[0] === loosePort || c[1] === loosePort)) {
      const nextBridges = findAllBridges(loosePort, leftovers, depth + 1);
      for(let nextBridge of nextBridges) {
        bridges.push([link, ...nextBridge]);
      }
    } else {
      bridges.push([link]);
    }
  }

  return bridges;
}

function componentsWithPort(port, components) {
  return components.filter(c => c.includes(port));
}

function otherPort(component, usedPort) {
  if(component[0] === usedPort) { return component[1]; }
  if(component[1] === usedPort) { return component[0]; }
  throw new Error(`This component (${component.join('/')}) doesn't have a port ${usedPort}!`);
}

export default { part1, part2 };
