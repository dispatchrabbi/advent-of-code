import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input: string, options = {}) {
  const coordinates = parseInput(input);

  let maxArea = 0;
  for(let i = 0; i < coordinates.length; ++i) {
    for(let j = i + 1; j < coordinates.length; ++j) {
      const area = computeRectArea(coordinates[i], coordinates[j]);
      if(area > maxArea) {
        maxArea = area;
      }
    }
  }

  return maxArea;
}

async function* part2(input: string, options = {}) {
  const coordinates = parseInput(input);
  const segments = makeConsecutiveLineSegments(coordinates);

  let maxArea = 0;
  for(let i = 0; i < coordinates.length; ++i) {
    for(let j = i + 1; j < coordinates.length; ++j) {
      const area = computeRectArea(coordinates[i], coordinates[j]);
      if(area > maxArea && !doAnySegmentsIntersectTheRect(coordinates[i], coordinates[j], segments, area)) {
        // console.log(`${area}: `, coordinates[i], coordinates[j]);
        maxArea = area;
      }
    }
  }

  return maxArea;
}

type Point = [number, number];
type Segment = [Point, Point];

function parseInput(input: string): Point[] {
  return input.trimEnd().split('\n').map(line => line.split(',').map(x => +x)) as Point[];
}

function computeRectArea(p1: Point, p2: Point): number {
  const area = (Math.abs(p1[0] - p2[0]) + 1) * (Math.abs(p1[1] - p2[1]) + 1);

  return area;
}

function makeConsecutiveLineSegments(points: Point[]): Segment[] {
  const segments: [Point, Point][] = [];
  for(let i = 0; i < points.length; ++i) {
    // mod here in order to get the last segment on the wraparound
    segments.push([points[i % points.length], points[(i + 1) % points.length]]);
  }

  return segments;
}

function doAnySegmentsIntersectTheRect(p1: Point, p2: Point, segments: Segment[], area: number): boolean {
  for(const segment of segments) {
    const s0Inside = isInsideRect(segment[0], p1, p2);
    const s1Inside = isInsideRect(segment[1], p1, p2);
    const cutsAcross = cutsAcrossRectangle(segment, p1, p2);

    if(
      isInsideRect(segment[0], p1, p2) ||
      isInsideRect(segment[1], p1, p2) ||
      cutsAcrossRectangle(segment, p1, p2)
    ) {
      return true;
    }

    if(area === 99) {
        console.log(`${area}: s0 ${s0Inside} s1 ${s1Inside} cut ${cutsAcross}`);
        console.log(fmtGrid(segments.flat(), p1, p2, segment));
        console.log('\n\n');
      }
  }

  return false;
}

function isInsideRect(p: Point, corner1: Point, corner2: Point) {
  const minX = Math.min(corner1[0], corner2[0]);
  const maxX = Math.max(corner1[0], corner2[0]);

  const minY = Math.min(corner1[1], corner2[1]);
  const maxY = Math.max(corner1[1], corner2[1]);

  return (minX < p[0] && p[0] < maxX && minY < p[1] && p[1] < maxY);
}

function cutsAcrossRectangle(s: Segment, corner1: Point, corner2: Point) {
  if(eql(s[0], corner1) || eql(s[0], corner2) || eql(s[1], corner1) || eql(s[1], corner2)) {
    return false;
  }

  return intersect([corner1, corner2], s);
}

function intersect(s1: Segment, s2: Segment) {
  const oneSideArea = signedArea(s2[0], s1[0], s1[1]);
  const otherSideArea = signedArea(s2[1], s1[0], s1[1]);

  return (oneSideArea > 0 && otherSideArea < 0) || (oneSideArea < 0 && otherSideArea > 0);
}

function signedArea(p1: Point, p2: Point, p3: Point) {
  return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[1]);
}

function eql(a: Point, b: Point) {
  return a[0] === b[0] && a[1] === b[1];
}

function fmtPoint(p: Point) {
  return `(${p[0]}, ${p[1]})`;
}

function fmtGrid(coordinates: Point[], p1: Point, p2: Point, otherPoints: Point[] = []): string {
  const minX = Math.min(...coordinates.map(p => p[0]));
  const minY = Math.min(...coordinates.map(p => p[1]));
  const maxX = Math.max(...coordinates.map(p => p[0]));
  const maxY = Math.max(...coordinates.map(p => p[1]));

  const grid: string[][] = [];
  for(let y = minY; y <= maxY; ++y) {
    const row: string[] = [];
    for(let x = minX; x <= maxX; ++x) {
      const point: Point = [x, y];
      if(otherPoints.some(op => eql(point, op))) {
        row.push('@');
      } else if(eql(point, p1) || eql(point, p2)) {
        row.push('O');
      } else if(coordinates.some(op => eql(point, op))) {
        row.push('X');
      } else {
        row.push('.');
      }
    }
    grid.push(row);
  }

  return grid.map(line => line.join('')).join('\n');
}

export default { part1, part2 };
