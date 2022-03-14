import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { rotate } from '#utils/arr';
import { draw2dArray } from '#utils/dots';
import { sleep } from '#utils/debug';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { screenWidth: 50, screenHeight: 6 }) {
  const instructions = parseInput(input);

  const screen = new Screen(options.screenWidth, options.screenHeight);

  const executeGen = screen.executeInstructions(instructions);
  while(!executeGen.next().done) {}

  return screen.countLitPixels();
}

async function* part2(input, options = {}) {
  const instructions = parseInput(input);

  const screen = new Screen(options.screenWidth, options.screenHeight);
  yield frame(draw2dArray(screen.pixels), 'Start');
  for(let result of screen.executeInstructions(instructions)) {
    yield frame(draw2dArray(screen.pixels), result.text);
  }

  return "printed above";
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  const RECT_REGEX = /^rect (\d+)x(\d+)$/;
  const ROTATE_ROW_REGEX = /^rotate row y=(\d+) by (\d+)$/;
  const ROTATE_COLUMN_REGEX = /^rotate column x=(\d+) by (\d+)$/;

  const instructions = lines.map(line => {
    let match;
    if(match = RECT_REGEX.exec(line)) {
      return { operation: 'rect', arguments: [ match[1], match[2] ], text: line };
    } else if(match = ROTATE_ROW_REGEX.exec(line)) {
      return { operation: 'rotateRow', arguments: [ match[1], match[2] ], text: line };
    } else if(match = ROTATE_COLUMN_REGEX.exec(line)) {
      return { operation: 'rotateColumn', arguments: [ match[1], match[2] ], text: line };
    }
  });

  return instructions;
}

class Screen {
  constructor(screenWidth = 50, screenHeight = 6) {
    this.pixels = Array(screenHeight).fill(null).map(row => Array(screenWidth).fill(false));
  }

  countLitPixels() {
    return this.pixels.reduce((total, row) => total + row.filter(p => !!p).length, 0);
  }

  *executeInstructions(instructions) {
    for(let instruction of instructions) {
      this[instruction.operation](...instruction.arguments);
      yield instruction;
    }
  }

  rect(width, height) {
    for(let row = 0; row < height; row++) {
      for(let col = 0; col < width; col++) {
        this.pixels[row][col] = true;
      }
    }
  }

  rotateRow(row, places) {
    this.pixels[row] = rotate(this.pixels[row], places);
  }

  rotateColumn(column, places) {
    // log.debug(this.pixels.map(row => row[column]));
    // log.debug(rotate(this.pixels.map(row => row[column]), places))
    rotate(this.pixels.map(row => row[column]), places).forEach((el, ix) => this.pixels[ix][column] = el);
  }
}

export default { part1, part2 };
