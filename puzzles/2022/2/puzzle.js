import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

import { sum } from '#utils/maths';

const MOVES = {
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3,
};

const PART1_CODES = {
  A: MOVES.ROCK,
  B: MOVES.PAPER,
  C: MOVES.SCISSORS,
  X: MOVES.ROCK,
  Y: MOVES.PAPER,
  Z: MOVES.SCISSORS
};
async function* part1(input, options = {}) {
  const rounds = parseInput(input);

  const score = sum(rounds.map(([opponent, you]) => scoreRound(PART1_CODES[opponent], PART1_CODES[you])));

  return score;
}

const PART2_STRATEGY = {
  X: { // loss
    A: MOVES.SCISSORS, // rock smashes scissors
    B: MOVES.ROCK, // paper covers rock
    C: MOVES.PAPER, // scissors cuts rock
  },
  Y: { // draw
    A: MOVES.ROCK,
    B: MOVES.PAPER,
    C: MOVES.SCISSORS,
  },
  Z: { // win
    A: MOVES.PAPER, // rock covered by paper
    B: MOVES.SCISSORS, // paper cut by scissors
    C: MOVES.ROCK // scissors smashed by rock
  },
};
async function* part2(input, options = {}) {
  const rounds = parseInput(input);

  const score = sum(rounds.map(([opponent, outcome]) => scoreRound(PART1_CODES[opponent], PART2_STRATEGY[outcome][opponent])));

  return score;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(' '));
}

const WIN_POINTS = 6;
const DRAW_POINTS = 3;
const LOSS_POINTS = 0;
function scoreRound(opponent, you) {
  let score = you;

  if( (you === MOVES.ROCK && opponent === MOVES.SCISSORS) ||
      (you === MOVES.SCISSORS && opponent === MOVES.PAPER) ||
      (you === MOVES.PAPER && opponent === MOVES.ROCK)
  ) {
    score += WIN_POINTS;
  } else if(you === opponent) {
    score += DRAW_POINTS;
  } else {
    score += LOSS_POINTS;
  }

  return score;
}

function determineMoveForOutcome(opponent, outcome) {
}

export default { part1, part2 };
