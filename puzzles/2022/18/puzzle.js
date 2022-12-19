import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { orthogonal3d } from '#utils/grid';
import { outersect, uniquify } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const cubes = parseInput(input);

  const exposed = findExposedSurfaces(cubes);

  return exposed.length;
}

async function* part2(input, options = {}) {
  const cubes = parseInput(input);

  const exteriorSurfaceArea = findExteriorSurfaces(cubes);
  return exteriorSurfaceArea;

  // const exposed = findExteriorSurfacesDFS(cubes);
  // return exposed.length;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(',')).map(([x, y, z]) => ({ x: +x, y: +y, z: +z }));
}

function findExposedSurfaces(cubes) {
  let surfaces = [];

  for(let cube of cubes) {
    surfaces.push(...orthogonal3d(cube));
  }

  // remove surfaces that face cubes
  surfaces = surfaces.filter(s => !includesCube(cubes, s));
  return surfaces;
}

function findExteriorSurfacesDFS(cubes) {
  let surfaces = [];
  let xMin = Infinity, xMax = -Infinity;
  let yMin = Infinity, yMax = -Infinity;
  let zMin = Infinity, zMax = -Infinity;

  for(let cube of cubes) {
    surfaces.push(...orthogonal3d(cube));
    xMin = Math.min(xMin, cube.x);
    xMax = Math.max(xMax, cube.x);
    yMin = Math.min(yMin, cube.y);
    yMax = Math.max(yMax, cube.y);
    zMin = Math.min(zMin, cube.z);
    zMax = Math.max(zMax, cube.z);
  }

  // remove surfaces that face cubes
  surfaces = surfaces.filter(s => !includesCube(cubes, s));

  // now we're going to check all the surfaces to see if they are exterior
  // we're going to do that by expanding outward over and over and pruning the ones that run into cubes
  // if we reach the outside (defined by a coordinate going outside min or max), it's exterior

  // we'll start with known exterior surfaces
  const exteriorSurfaces = surfaces.filter(s => (
    !cubes.some(cube => cube.x > s.x && cube.y === s.y && cube.z === s.z) ||
    !cubes.some(cube => cube.x < s.x && cube.y === s.y && cube.z === s.z) ||
    !cubes.some(cube => cube.x === s.x && cube.y < s.y && cube.z === s.z) ||
    !cubes.some(cube => cube.x === s.x && cube.y > s.y && cube.z === s.z) ||
    !cubes.some(cube => cube.x === s.x && cube.y === s.y && cube.z < s.z) ||
    !cubes.some(cube => cube.x === s.x && cube.y === s.y && cube.z > s.z)
  ));

  const questionableSurfaces = surfaces.filter(s => !includesCube(exteriorSurfaces, s));
  const questionableCubes = uniquify(questionableSurfaces, areCubesEqual);

  for(let surface of questionableCubes) {
    const examined = [ ];
    let examinationQueue = [ surface ];
    while(examinationQueue.length > 0) {
      const toExamine = examinationQueue.shift();
      if(includesCube(examined, toExamine)) { break; }

      // did we reach a known-good surface, or break the minmax bonds?
      if(includesCube(exteriorSurfaces, toExamine) || reachedTheOutside(toExamine, xMin, xMax, yMin, yMax, zMin, zMax)) {
        // record this surface as external (with all its duplicates), move on to the next one
        const matchingSurfaces = questionableSurfaces.filter(s => areCubesEqual(s, surface));
        exteriorSurfaces.push(...matchingSurfaces);
        break;
      }

      // otherwise, let's expand the queue
      examined.push(toExamine);
      const additions = orthogonal3d(toExamine)
        .filter(s => !includesCube(examined, s)) // filter out surfaces we've already examined
        .filter(s => !includesCube(cubes, s)) // filter out cubes
      examinationQueue.unshift(...additions);
    }

    // if there are no surfaces left, we must be on the inside, so don't record anything and move on
  }

  return exteriorSurfaces;
}

function findExteriorSurfaces(cubes) {
  let xMin = Infinity, xMax = -Infinity;
  let yMin = Infinity, yMax = -Infinity;
  let zMin = Infinity, zMax = -Infinity;

  for(let cube of cubes) {
    xMin = Math.min(xMin, cube.x);
    xMax = Math.max(xMax, cube.x);
    yMin = Math.min(yMin, cube.y);
    yMax = Math.max(yMax, cube.y);
    zMin = Math.min(zMin, cube.z);
    zMax = Math.max(zMax, cube.z);
  }

  // we're going to flood fill from the outside in
  const fill = [];
  for(let x = xMin - 1; x <= xMax + 1; ++x) {
    for(let y = yMin - 1; y <= yMax + 1; ++y) {
      for(let z = zMin - 1; z <= zMax + 1; ++z) {
        if(x === xMin - 1 || x === xMax + 1) {
          fill.push({x, y, z}); // floor and ceiling
        } else if((y === yMin - 1 || y === yMax + 1) || (z === zMin - 1 || z === zMax + 1)) {
          fill.push({x, y, z}); // walls
        }
      }
    }
  }

  let surfaceArea = 0;

  const seen = [];
  while(fill.length > 0) {
    const toExamine = fill.shift();
    let neighbors = orthogonal3d(toExamine);
    neighbors = neighbors.filter(s => (
      s.x >= (xMin - 1) && s.x <= (xMax + 1) &&
      s.y >= (yMin - 1) && s.y <= (yMax + 1) &&
      s.z >= (zMin - 1) && s.z <= (zMax + 1)
    )); // wrong direction
    neighbors = neighbors.filter(s => !includesCube(seen, s)); // already looked at these
    neighbors = neighbors.filter(s => !includesCube(fill, s)); // already in the queue

    const keepFilling = neighbors.filter(s => !includesCube(cubes, s));
    surfaceArea += (neighbors.length - keepFilling.length);

    fill.push(...keepFilling);
    seen.push(toExamine);
  }

  return surfaceArea;
}

function includesCube(cubes, subject) {
  return cubes.some(cube => areCubesEqual(cube, subject));
}

function areCubesEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function reachedTheOutside(cube, xMin, xMax, yMin, yMax, zMin, zMax) {
  return cube.x < xMin || cube.x > xMax || cube.y < yMin || cube.y > yMax || cube.z < zMin || cube.z > zMax;
}

export default { part1, part2 };
