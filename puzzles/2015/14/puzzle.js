import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

async function part1(input, options = { seconds: 2503 }) {
  const peloton = parseInput(input);

  for(let t = 0; t < options.seconds; ++t) {
    step(peloton);
  }

  return findLeadingReindeer(peloton)[0].distance;
}

async function part2(input, options = { seconds: 2503 }) {
  const peloton = parseInput(input);

  for(let t = 0; t < options.seconds; ++t) {
    step(peloton);
  }

  return peloton.reduce((winner, deer) => deer.points > winner.points ? deer : winner, { points: -Infinity }).points;
}

const REINDEER_REGEX = /(\w+) can fly (\d+) km\/s for (\d+) seconds, but then must rest for (\d+) seconds./;
function parseInput(input) {
  const reindeer = input.trim().split('\n').map(line => {
    const [ _, name, speed, stamina, rest ] = REINDEER_REGEX.exec(line);
    return {
      name,
      speed: +speed,
      stamina: +stamina,
      rest: +rest,
      isFlying: true,
      elapsed: 0,
      distance: 0,
      points: 0,
    };
  });

  return reindeer;
}

function step(peloton) {
  for(let reindeer of peloton) {
    reindeer.elapsed += 1;

    if(reindeer.isFlying) {
      reindeer.distance += reindeer.speed;

      if(reindeer.elapsed >= reindeer.stamina) {
        reindeer.isFlying = false;
        reindeer.elapsed = 0;
      }
    } else if(reindeer.elapsed >= reindeer.rest) {
      reindeer.isFlying = true;
      reindeer.elapsed = 0;
    }
  }

  // have to account for ties - each leader gets a point
  for(let reindeer of findLeadingReindeer(peloton)) {
    reindeer.points += 1;
  }
}

function findLeadingReindeer(peloton) {
  let leadingDistance = -Infinity;
  let leaders = [];

  for(let reindeer of peloton) {
    if(reindeer.distance > leadingDistance) {
      leadingDistance = reindeer.distance;
      leaders = [ reindeer ];
    } else if(reindeer.distance === leadingDistance) {
      leaders.push(reindeer);
    }
  }

  return leaders;
}

export default { part1, part2 };
