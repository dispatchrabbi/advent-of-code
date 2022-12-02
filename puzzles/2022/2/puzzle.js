import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

import { sum } from '#utils/maths';

const MOVES = {
  ROCK: 0,
  PAPER: 1,
  SCISSORS: 2,
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
  X: losingMove,
  Y: drawMove,
  Z: winningMove,
};
async function* part2(input, options = {}) {
  const rounds = parseInput(input);

  const score = sum(rounds.map(([opponent, outcome]) => scoreRound(
    PART1_CODES[opponent],
    PART2_STRATEGY[outcome](PART1_CODES[opponent])
  )));

  return score;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(' '));
}

const WIN_POINTS = 6;
const DRAW_POINTS = 3;
const LOSS_POINTS = 0;
function scoreRound(opponent, you) {
  let score = you + 1;

  if(you === opponent) {
    score += DRAW_POINTS;
  } else if(isWin(you, opponent)) {
    score += WIN_POINTS;
  } else {
    score += LOSS_POINTS;
  }

  return score;
}

function isWin(you, opponent) {
  return (you - opponent + 3) % 3 === 1;
}

function winningMove(move) {
  return (move + 1) % 3;
}

function losingMove(move) {
  return (move + 2) % 3;
}

function drawMove(move) {
  return move;
}

export default { part1, part2 };
