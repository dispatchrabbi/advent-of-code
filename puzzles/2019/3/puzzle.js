import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { manhattan } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const wires = parseInput(input);
  const [ aSegments, bSegments ] = wires.map(convertToSegments);

  const intersections = findIntersections(aSegments, bSegments);
  const closestIntersection = intersections.reduce(({ winner, distance}, candidate) => {
    const candidateDistance = manhattan(candidate, { x: 0, y: 0 });
    if(candidateDistance < distance) {
      return { winner: candidate, distance: candidateDistance };
    } else {
      return { winner, distance };
    }
  }, { winner: null, distance: Infinity });

  return closestIntersection.distance;
}

async function* part2(input, options = {}) {
  const wires = parseInput(input);
  const [ aSegments, bSegments ] = wires.map(convertToSegments);

  const intersections = findIntersections(aSegments, bSegments);
  const closestIntersection = intersections.reduce(({ winner, distance}, candidate) => {
    // there is definitely a better way to do this, but this takes the least effort to modify part1
    const candidateDistance = signalDelay(candidate, aSegments) + signalDelay(candidate, bSegments);
    if(candidateDistance < distance) {
      return { winner: candidate, distance: candidateDistance };
    } else {
      return { winner, distance };
    }
  }, { winner: null, distance: Infinity });

  return closestIntersection.distance;
}

function parseInput(input) {
  return input.trimEnd().split('\n').map(line => line.split(',').map(move => ({
    heading: move[0],
    distance: +(move.slice(1)),
  })));
}

function convertToSegments(wire) {
  const segments = [];

  let start = { x: 0, y: 0 };
  for(let { heading, distance } of wire) {
    const next = moveFromPoint(start, heading, distance);
    segments.push([
      start,
      next,
    ]);

    start = next;
  }

  return segments;
}

function moveFromPoint({ x, y }, heading, distance) {
  const point = { x, y };
  switch(heading) {
    case 'U':
      point.y += distance;
      break;
    case 'D':
      point.y -= distance;
      break;
    case 'L':
      point.x -= distance;
      break;
    case 'R':
      point.x += distance;
      break;
    default:
      throw new Error(`Unknown heading: ${heading}`);
  }

  return point;
}

function findIntersections(aSegments, bSegments) {
  const intersections = [];
  for(let aSegment of aSegments) {
    for(let bSegment of bSegments) {
      intersections.push(findIntersection(aSegment, bSegment));
    }
  }

  // filter out the nulls and the trivial intersection at the origin
  return intersections.filter(el => el && !(el.x === 0 && el.y === 0));
}

function findIntersection(a, b) {
  let horizontal = null;
  let vertical = null;

  if(a[0].x === a[1].x) {
    vertical = a;
  } else if(a[0].y === a[1].y) {
    horizontal = a;
  } else {
    throw new Error(`First segment given is not horizonal or vertical: ${a}`);
  }

  if(b[0].x === b[1].x) {
    vertical = b;
  } else if(b[0].y === b[1].y) {
    horizontal = b;
  } else {
    throw new Error(`Second segment given is not horizonal or vertical: ${b}`);
  }

  if(horizontal === null || vertical === null) {
    // they are parallel
    return null;
  }

  return (
    vertical[0].x >= Math.min(horizontal[0].x, horizontal[1].x) &&
    vertical[0].x <= Math.max(horizontal[0].x, horizontal[1].x) &&
    horizontal[0].y >= Math.min(vertical[0].y, vertical[1].y) &&
    horizontal[0].y <= Math.max(vertical[0].y, vertical[1].y)
  ) ? { x: vertical[0].x, y: horizontal[0].y } : null;
}

function signalDelay({ x, y }, segments) {
  let distance = 0;

  for(let segment of segments) {
    if(
      (x === segment[0].x || y === segment[0].y) &&
      x >= Math.min(segment[0].x, segment[1].x) && x <= Math.max(segment[0].x, segment[1].x) &&
      y >= Math.min(segment[0].y, segment[1].y) && y <= Math.max(segment[0].y, segment[1].y)
    ) {
      // the point is on this segment
      distance += manhattan(segment[0], { x, y });
      break;
    } else {
      distance += manhattan(segment[0], segment[1]);
    }
  }

  return distance;
}

export default { part1, part2 };
