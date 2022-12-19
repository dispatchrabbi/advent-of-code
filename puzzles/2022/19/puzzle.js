import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum, product } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const blueprints = parseInput(input);

  const outcomes = blueprints.map(b => b.number * findBestOutcomeForBlueprint(b, 24));

  return sum(outcomes);
}

async function* part2(input, options = {}) {
  const blueprints = parseInput(input);

  const outcomes = blueprints.slice(0, 3).map(b => findBestOutcomeForBlueprint(b, 32));

  return product(outcomes);
}

const INPUT_REGEX = /^Blueprint (\d+): Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian.$/;
function parseInput(input) {
  return input.trim().split('\n').map((line, ix) => {
    const matches = INPUT_REGEX.exec(line);
    return {
      number: +matches[1],
      costs: {
        ore: { ore: +matches[2], clay: 0, obsidian: 0 },
        clay: { ore: +matches[3], clay: 0, obsidian: 0 },
        obsidian: { ore: +matches[4], clay: +matches[5], obsidian: 0 },
        geode: { ore: +matches[6], clay: 0, obsidian: +matches[7] },
      },
    };
  })
}

function findBestOutcomeForBlueprint(blueprint, minutes) {
  log.debug(`Starting blueprint #${blueprint.number}`);
  const startingState = {
    minutes,
    robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    bank: { ore: 0, clay: 0, obsidian: 0, geode: 0 }
  };

  const maxCostsNeeded = Object.values(blueprint.costs).reduce((maxes, cost) => ({
    ore: Math.max(maxes.ore, cost.ore),
    clay: Math.max(maxes.clay, cost.clay),
    obsidian: Math.max(maxes.obsidian, cost.obsidian),
  }), { ore: 0, clay: 0, obsidian: 0});

  let currentMaxGeodes = 0;
  let states = [ startingState ];
  while(states.length > 0) {
    // log.debug('states.length', states.length, states[0]);
    const state = states.shift();

    // it takes at least 2 minutes for a new robot to mine, so if we only have 1 minute left, don't try to buy a robot
    let nextStates = [];
    if(state.minutes > 1) {
      // we can fast-forward to the next notable state in a couple ways:
      // or, by fast-forwarding to the next time we buy a robot
      // unless we have all the resources of that type we could ever need
      nextStates = [
        (state.robots.ore * state.minutes) + state.bank.ore < (maxCostsNeeded.ore * state.minutes) ? fastForwardStateToBuyRobot(state, blueprint, 'ore') : null,
        (state.robots.clay * state.minutes) + state.bank.clay < (maxCostsNeeded.clay * state.minutes) ? fastForwardStateToBuyRobot(state, blueprint, 'clay') : null,
        (state.robots.obsidian * state.minutes) + state.bank.obsidian < (maxCostsNeeded.obsidian * state.minutes) ? fastForwardStateToBuyRobot(state, blueprint, 'obsidian') : null,
        fastForwardStateToBuyRobot(state, blueprint, 'geode') // always try to buy a geode robot
      ].filter(s => s !== null); // filter out null responses
      states.unshift(...nextStates);
    }

    // first, by not buying any more robots and just mining - and then we're done
    // only do this if we won't be able to afford a robot
    if(nextStates.length === 0 && state.robots.geode > 0) { // not worth doing this if we can't mine any geodes
      const endState = fastForwardStateWithoutBuyingRobots(state);
      states.unshift(endState);
    }

    // see if we have a new high score
    const highestGeodeCount = states.filter(s => s.minutes <= 0).reduce((max, state) => Math.max(max, state.bank.geode), -Infinity);
    if(highestGeodeCount > currentMaxGeodes) {
      log.debug(`new highest count: ${highestGeodeCount} > ${currentMaxGeodes}`);
      currentMaxGeodes = highestGeodeCount;
    }
    states = states.filter(s => s.minutes > 0);
  }

  return currentMaxGeodes;
}

function fastForwardStateToBuyRobot(state, blueprint, robotToBuy) {
  // how short on resources are we?
  const materialsNeeded = {
    ore: blueprint.costs[robotToBuy].ore - state.bank.ore,
    clay: blueprint.costs[robotToBuy].clay - state.bank.clay,
    obsidian: blueprint.costs[robotToBuy].obsidian - state.bank.obsidian,
  };

  const minutesNeededPerMaterial = {
    ore: materialsNeeded.ore > 0 ? Math.ceil(materialsNeeded.ore / state.robots.ore) : 0,
    clay: materialsNeeded.clay > 0 ? Math.ceil(materialsNeeded.clay / state.robots.clay) : 0,
    obsidian: materialsNeeded.obsidian > 0 ? Math.ceil(materialsNeeded.obsidian / state.robots.obsidian) : 0,
  };

  const minutesNeeded = Math.max(
    ...Object.values(minutesNeededPerMaterial),
    0 // if we already have the materials needed, the above will all be negative
  ) + 1; // + 1 for the turn to make the robot

  if(minutesNeeded > state.minutes) {
    return null;
  }

  const nextState = {
    minutes: state.minutes - minutesNeeded,
    robots: {
      ore: state.robots.ore + (robotToBuy === 'ore' ? 1 : 0),
      clay: state.robots.clay + (robotToBuy === 'clay' ? 1 : 0),
      obsidian: state.robots.obsidian + (robotToBuy === 'obsidian' ? 1 : 0),
      geode: state.robots.geode + (robotToBuy === 'geode' ? 1 : 0)
    },
    bank: {
      ore: state.bank.ore + (state.robots.ore * minutesNeeded) - (robotToBuy ? blueprint.costs[robotToBuy].ore : 0),
      clay: state.bank.clay + (state.robots.clay * minutesNeeded) - (robotToBuy ? blueprint.costs[robotToBuy].clay : 0),
      obsidian: state.bank.obsidian + (state.robots.obsidian * minutesNeeded) - (robotToBuy ? blueprint.costs[robotToBuy].obsidian : 0),
      geode: state.bank.geode + (state.robots.geode * minutesNeeded) /* - (robotToBuy ? blueprint.costs[robotToBuy].geode : 0)*/
    }
  }

  return nextState;
}

function fastForwardStateWithoutBuyingRobots(state) {
  const nextState = {
    minutes: 0,
    robots: {
      ore: state.robots.ore,
      clay: state.robots.clay,
      obsidian: state.robots.obsidian,
      geode: state.robots.geode,
    },
    bank: {
      ore: state.bank.ore + (state.robots.ore * state.minutes),
      clay: state.bank.clay + (state.robots.clay * state.minutes),
      obsidian: state.bank.obsidian + (state.robots.obsidian * state.minutes),
      geode: state.bank.geode + (state.robots.geode * state.minutes),
    }
  };

  return nextState;
}


export default { part1, part2 };
