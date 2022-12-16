import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { coords2str, manhattan, str2coords } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { y: 2000000 }) {
  const sensors = parseInput(input);

  const beaconlessSpots = findSpotsOnRowWithNoBeacons(sensors, options.y);
  return beaconlessSpots.length;
}

async function* part2(input, options = { bounds: 4000000 }) {
  const sensors = parseInput(input);

  const lostBeacon = findLostBeacon(sensors);

  return lostBeacon.x * 4000000 + lostBeacon.y;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => {
    // Sensor at x=2, y=18: closest beacon is at x=-2, y=15
    const ints = line.match(/[-]?\d+/g);
    const location = { x: +ints[0], y: +ints[1] };
    const beacon = { x: +ints[2], y: +ints[3] };

    return {
      location,
      beacon,
      radius: manhattan(location, beacon)
    };
  });
}

function findSpotsOnRowWithNoBeacons(sensors, y) {
  let ranges = [];

  for(let sensor of sensors) {
    const verticalDistance = Math.abs(sensor.location.y - y);
    const horizontalMax = sensor.radius - verticalDistance;

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

function findLostBeacon(sensors) {
  // so... if there's only one lost beacon in this whole field,
  // it's going to be radius + 1 units from 4 sensors,
  // which means it'll be sandwiched between the "circumerences" of two sensors (which makes a line at 45deg)
  // and it'll be sandwiched that way between two such sets of sensors, with the sandwich lines perpendicular
  // so... let's find two lines going perpendicular to each other

  const slashLines = []; // storing C in equations of the form y = x + C, or y - x = C
  const backslashLines = []; // storing K in equations of the form y = -x + K, or y + x = K

  for(let i = 0; i < sensors.length; ++i) {
    for(let j = i + 1; j < sensors.length; ++j) {
      // see if these sensors are the appropriate distance to be on a line with each other and allow a 1 space gap
      if(sensors[i].radius + sensors[j].radius + 2 === manhattan(sensors[i].location, sensors[j].location)) {
        // do a sort to guarantee that s1.location.x < s2.location.x
        const [ s1, s2 ] = [ sensors[i], sensors[j] ].sort((a, b) => a.location.x - b.location.x);
        const [ l1, l2 ] = [ s1.location, s2.location ];

        if(Math.sign(l2.x - l1.x) === Math.sign(l2.y - l1.y)) {
          // the edge is \, so we need to determine K for the edge line
          const k = (l1.x + l1.y) + (s1.radius + 1);
          backslashLines.push(k);
        } else {
          // the edge is /, so we need to determine C for the edge line
          const c = (l1.y - l1.x) - (s1.radius + 1);
          slashLines.push(c);
        }
      }
    }
  }

  // so now, we compute the intersections of each of our two sets of lines
  // and make sure that intersection is too far away from all the sensors
  for(let c of slashLines) {
    for(let k of backslashLines) {
      // y - x = C; y + x = K
      // 2y = C + K; y = (C + K) / 2
      // 2x = K - C; x = (K - C) / 2
      const [ y, x ] = [ (c + k) / 2, (k - c) / 2 ];

      if(Math.floor(x) !== x || Math.floor(y) !== y) { continue; } // no non-integer solutions, please

      if(sensors.every(s => manhattan(s.location, { x, y }) > s.radius)) {
        return { x, y };
      }
    }
  }
}

function findLostBeaconWithRadii(sensors, bounds = Infinity) {
  // so... if there's only one lost beacon in this whole field,
  // it's going to be at radius + 1 units from a sensor
  // and in fact it's going to be at radius + 1 units from 4 sensors
  // and no closer than radius + 1 to any other sensor

  const coordsHit = new Map();
  for(let sensor of sensors) {
    const coords = findCoordinatesAtRadius(sensor.location, sensor.radius + 1)
      .filter(coord => (
        (coord.x >= 0 && coord.x <= bounds && coord.y >= 0 && coord.y <= bounds) &&
        sensors.every(s => manhattan(coord, s.location) >= (s.radius + 1)) // no sensor is close enough to this point to have detected it
      ));

    for(let coord of coords) {
      const nearbySensors = sensors.filter(s => manhattan(coord, s.location) === (s.radius + 1));
      if(nearbySensors.length >= 4) {
        return coord;
      }
    }
  }
}

function findCoordinatesAtRadius(center, radius) {
  const coords = [];
  for(let i = 0; i < radius; ++i) {
    coords.push(
      { x: center.x + i, y: center.y + (radius - i) }, // NE side of the square
      { x: center.x + (radius - i), y: center.y - i }, // SE side of the square
      { x: center.x - i, y: center.y - (radius - i) }, // SW side of the square
      { x: center.x - (radius - i), y: center.y + i }  // NW side of the square
    );
  }
  return coords;
}

export default { part1, part2 };
