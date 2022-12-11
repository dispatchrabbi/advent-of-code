import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { MapWithDefaultValue } from '#utils/graph';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { startingState, diagnosticsAfter, states } = parseInput(input);

  const turing = new TuringMachine(states, startingState);
  for(let i = 1; i <= diagnosticsAfter; ++i) {
    turing.step();
  }

  const checksum = turing.checksum();
  return checksum;
}

async function* part2(input, options = {}) {
  return null;
}

function parseInput(input) {
  const [ instructions, ...stateSections ] = input.trim().split('\n\n');

  const [ startingStateLine, diagnosticsLine ] = instructions.split('\n');
  const startingState = startingStateLine[startingStateLine.length - 2];
  const diagnosticsAfter = +/\d+/.exec(diagnosticsLine)[0];

  // In state A:
  //   If the current value is 0:
  //     - Write the value 1.
  //     - Move one slot to the right.
  //     - Continue with state B.
  //   If the current value is 1:
  //     - Write the value 0.
  //     - Move one slot to the left.
  //     - Continue with state C.

  const states = stateSections.reduce((states, section) => {
    const lines = section.split('\n');

    const nameLine = lines[0];
    const name = nameLine[nameLine.length - 2];

    const instructions = [ lines.slice(2, 5), lines.slice(6, 9) ].map(([writeLine, moveLine, nextLine]) => ({
      write: +writeLine[writeLine.length - 2],
      move: moveLine.indexOf('left') > -1 ? -1 : 1,
      next: nextLine[nextLine.length - 2],
    }));

    states[name] = instructions;
    return states;
  }, {});

  return {
    startingState,
    diagnosticsAfter,
    states,
  };
}

class TuringMachine {
  constructor(states, initialState) {
    this._states = states;
    this._tape = new Set();

    this.stepCounter = 0;
    this.cursor = 0;
    this.state = initialState;
  }

  step() {
    const instructions = this._states[this.state][this.read()];

    this.write(instructions.write);
    this.cursor += instructions.move;
    this.state = instructions.next;

    this.stepCounter++;
  }

  read() {
    return this._tape.has(this.cursor) ? 1 : 0;
  }

  write(val) {
    if(val) {
      this._tape.add(this.cursor);
    } else {
      this._tape.delete(this.cursor);
    }
  }

  checksum() {
    return this._tape.size;
  }
}

export default { part1, part2 };
