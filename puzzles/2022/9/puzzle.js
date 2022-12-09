import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { coords2str, isAdjacent } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const moves = parseInput(input);

  const tailPositions = recordTailMoves(moves, 2);

  return tailPositions.size;
}

async function* part2(input, options = {}) {
  const moves = parseInput(input);

  const tailPositions = recordTailMoves(moves, 10);

  return tailPositions.size;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(' ')).map(([dir, times]) => ({ dir, times: +times }));
}

const MOVES = {
  U: { x:  0, y:  1 },
  D: { x:  0, y: -1 },
  L: { x: -1, y:  0 },
  R: { x:  1, y:  0 },
};
function recordTailMoves(moves, ropeSize) {
  const expandedMoves = moves.reduce((expanded, move) => expanded += move.dir.repeat(move.times), '').split('');

  const rope = Array(ropeSize).fill(0).map(() => ({ x: 0, y: 0 }));
  const tailPositions = new Set([ coords2str(rope[rope.length - 1]) ]);

  for(let move of expandedMoves) {
    rope[0].x += MOVES[move].x;
    rope[0].y += MOVES[move].y;

    for(let i = 1; i < rope.length; ++i) {
      rope[i] = moveTail(rope[i - 1], rope[i]);
    }

    tailPositions.add(coords2str(rope[rope.length - 1]));
  }

  return tailPositions;
}

function moveTail(head, tail) {
  // adjacent, diagonal, and overlapping count as touching
  if(isAdjacent(head, tail)) {
    return tail;
  }

  // move x and y each so that one matches and one is 1 off
  // for example:
  // if head = (10, 8) and tail = (10, 10), move tail to (10, 9)
  // if head = (5, 17) and tail = (4, 19), move tail to (5, 18)
  // if head = (8, 16) and tail = (6, 17), move tail to (7, 16)

  const xMove = Math.max(Math.min(head.x - tail.x, 1), -1);
  tail.x += xMove;

  const yMove = Math.max(Math.min(head.y - tail.y, 1), -1);
  tail.y += yMove;

  return tail;
}

export default { part1, part2 };
