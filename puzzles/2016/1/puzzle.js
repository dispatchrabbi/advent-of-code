import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const directions = parseInput(input);

  const endpoint = walkTheGrid(directions);
  const distance = Math.abs(endpoint.x) + Math.abs(endpoint.y);

  return distance;
}

async function* part2(input, options = {}) {
  const directions = parseInput(input);

  const endpoint = findFirstTwiceVisitedLocation(directions);
  const distance = Math.abs(endpoint.x) + Math.abs(endpoint.y);

  return distance;
}

function parseInput(input) {
  return input.trim().split(', ');
}

function walkTheGrid(directions) {
  let position = { x: 0, y: 0 };
  let heading = 90;

  for(let direction of directions) {
    const [ turn, length ] = [ direction.substr(0, 1), +direction.substr(1) ];
    heading = changeHeading(heading, turn);
    const vec = heading2vec(heading);
    position.x += vec.x * length;
    position.y += vec.y * length;
  }

  return position;
}

function findFirstTwiceVisitedLocation(directions) {
  let position = { x: 0, y: 0 };
  let heading = 90;

  const seen = new Set();

  for(let direction of directions) {
    const [ turn, length ] = [ direction.substr(0, 1), +direction.substr(1) ];
    heading = changeHeading(heading, turn);
    const vec = heading2vec(heading);

    for(let step = 0; step < length; ++step) {
      // one of these will be 0 so this is all right
      position.x += vec.x;
      position.y += vec.y;

      if(seen.has(pos2str(position))) {
        return position;
      } else {
        seen.add(pos2str(position));
      }
    }
  }

  return null;
}

function changeHeading(heading, turn) {
  heading += turn === 'L' ? 90 : -90;
  if(heading < 0) { heading += 360; }
  if(heading >= 360) { heading -= 360; }
  return heading;
}

function heading2vec(heading) {
  const headingInRadians = heading * Math.PI / 180;
  // we have to round because otherwise we'll get like 6.123233995736766e-17 instead of 0
  return {
    x: Math.round(Math.cos(headingInRadians)),
    y: Math.round(Math.sin(headingInRadians))
  };
}

function pos2str({x, y}) {
  return `x:${x},y${y}`;
}

export default { part1, part2 };
