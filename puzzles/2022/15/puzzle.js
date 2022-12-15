import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { manhattan } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { y: 2000000 }) {
  const sensors = parseInput(input);

  const beaconlessSpots = findSpotsOnRowWithNoBeacons(sensors, options.y);
  return beaconlessSpots.length;
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  return parsed;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => {
    // Sensor at x=2, y=18: closest beacon is at x=-2, y=15
    const ints = line.match(/[-]?\d+/g);
    return {
      location: { x: +ints[0], y: +ints[1] },
      beacon: { x: +ints[2], y: +ints[3] },
    };
  });
}

function findSpotsOnRowWithNoBeacons(sensors, y) {
  let ranges = [];

  for(let sensor of sensors) {
    const radius = manhattan(sensor.location, sensor.beacon);
    const verticalDistance = Math.abs(sensor.location.y - y);
    const horizontalMax = radius - verticalDistance;

    if(horizontalMax <= 0) { continue; }

    const range = [ sensor.location.x - horizontalMax, sensor.location.x + horizontalMax ];
    // check if the beacon is on this row
    if(sensor.beacon.y === y && sensor.beacon.x === range[0] ) { range[0] += 1; }
    if(sensor.beacon.y === y && sensor.beacon.x === range[1] ) { range[1] -= 1; }

    ranges.push(range);
  }

  ranges = normalizeRanges(ranges);

  const spots = [];
  for(let [min, max] of ranges) {
    for(let i = min; i <= max; ++i) { spots.push(i); }
  }
  return spots;
}

function normalizeRanges(ranges) {
  ranges.sort((a, b) => a[0] - b[0]); // sort by starting coordinate

  for(let i = 0; i < ranges.length - 1; ++i) {
    if(ranges[i+1][0] <= ranges[i][1]) { // if they overlap
      ranges[i][1] = Math.max(ranges[i][1], ranges[i+1][1]); // combine the ranges
      ranges.splice(i + 1, 1);
      i -= 1; // I wish for Perl's repeat
    }
  }

  return ranges;
}

export default { part1, part2 };
