import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { cmp } from '#utils/arr';
import { lcm, sum } from '#utils/maths';
import { leftpad } from '#utils/text';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { steps: 1000 }) {
  const positions = parseInput(input);
  const moons = positions.map(makeMoon);

  // log.debug(`Step 0:`);
  // for(let moon of moons) {
  //   log.debug(`pos=<x=${leftpad(moon.position.x, 3)}, y=${leftpad(moon.position.y, 3)}, z=${leftpad(moon.position.z, 3)}>, vel=<x=${leftpad(moon.velocity.x, 3)}, y=${leftpad(moon.velocity.y, 3)}, z=${leftpad(moon.velocity.z, 3)}>`)
  // }
  // log.debug('');

  for(let i = 1; i <= options.steps; ++i) {
    gravitate(moons);
    velocitate(moons);

    // log.debug(`Step ${i}:`);
    // for(let moon of moons) {
    //   log.debug(`pos=<x=${leftpad(moon.position.x, 3)}, y=${leftpad(moon.position.y, 3)}, z=${leftpad(moon.position.z, 3)}>, vel=<x=${leftpad(moon.velocity.x, 3)}, y=${leftpad(moon.velocity.y, 3)}, z=${leftpad(moon.velocity.z, 3)}>`)
    // }
    // log.debug('');
  }

  const totalEnergy = sum(moons.map(calculateEnergy));

  return totalEnergy;
}

async function* part2(input, options = {}) {
  const positions = parseInput(input);

  const moonStep = function(moons) {
    gravitate1d(moons);
    velocitate1d(moons);

    return moons;
  }

  // find x period
  const xMoons = positions.map(position => ({ position: position.x, velocity: 0 }));
  const xPeriod = findPeriod(moonStep, xMoons);

  // find y period
  const yMoons = positions.map(position => ({ position: position.y, velocity: 0 }));
  const yPeriod = findPeriod(moonStep, yMoons);

  // find z period
  const zMoons = positions.map(position => ({ position: position.z, velocity: 0 }));
  const zPeriod = findPeriod(moonStep, zMoons);

  // find lcm of the x, y, and z periods
  const period = lcm(lcm(xPeriod, yPeriod), zPeriod);

  return period;
}

function parseInput(input) {
  const INPUT_REGEX = /^<x=([-]?\d+), y=([-]?\d+), z=([-]?\d+)>$/;
  return input.trimEnd().split('\n').map(line => {
    const result = INPUT_REGEX.exec(line);
    return { x: +result[1], y: +result[2], z: +result[3] };
  });
}

function makeMoon(position) {
  return {
    position,
    velocity: { x: 0, y: 0, z: 0 },
  };
}

function gravitate(moons) {
  for(let a = 0; a < moons.length; ++a) {
    for(let b = a + 1; b < moons.length; ++b) {
      const delta = {
        x: -cmp(moons[a].position.x, moons[b].position.x),
        y: -cmp(moons[a].position.y, moons[b].position.y),
        z: -cmp(moons[a].position.z, moons[b].position.z),
      };

      moons[a].velocity = add3d(moons[a].velocity, delta);
      moons[b].velocity = add3d(moons[b].velocity, scale3d(delta, -1));
    }
  }
}

function velocitate(moons) {
  for(let moon of moons) {
    moon.position = add3d(moon.position, moon.velocity);
  }
}

function calculateEnergy(moon) {
  const potential = Math.abs(moon.position.x) + Math.abs(moon.position.y) + Math.abs(moon.position.z);
  const kinetic = Math.abs(moon.velocity.x) + Math.abs(moon.velocity.y) + Math.abs(moon.velocity.z);

  return potential * kinetic;
}

function add3d({ x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 }) {
  return {
    x: x1 + x2,
    y: y1 + y2,
    z: z1 + z2,
  };
}

function scale3d({ x, y, z }, k) {
  return {
    x: x * k,
    y: y * k,
    z: z * k,
  };
}

function gravitate1d(moons) {
  for(let a = 0; a < moons.length; ++a) {
    for(let b = a + 1; b < moons.length; ++b) {
      const delta = -cmp(moons[a].position, moons[b].position);

      moons[a].velocity += delta;
      moons[b].velocity -= delta;
    }
  }
}

function velocitate1d(moons) {
  for(let moon of moons) {
    moon.position += moon.velocity;
  }
}

function findPeriod(stepfn, initial) {
  const seen = new Set();

  let turns = 0;
  let current = initial;
  while(true) {
    const serialized = JSON.stringify(current);
    if(seen.has(serialized)) {
      break;
    } else {
      seen.add(serialized);
    }

    current = stepfn(current);
    turns++;
  }

  return turns;
}

export default { part1, part2 };
