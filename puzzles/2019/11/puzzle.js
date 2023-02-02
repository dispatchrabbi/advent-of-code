import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Intcode } from '../common/intcode.js';
import { GridMap } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const program = parseInput(input);

  const robot = new HullPaintingRobot();
  await robot.initializeComputer(program);

  // paint until it's over
  while(await robot.paint()) { }

  const paintedSquares = robot.history.keys();
  return paintedSquares.length;
}

async function* part2(input, options = {}) {
  const program = parseInput(input);

  const robot = new HullPaintingRobot(HullPaintingRobot.COLOR.WHITE);
  await robot.initializeComputer(program);

  // paint until it's over
  while(await robot.paint()) { }

  log.debug('\n' + robot.showImage());

  return null;
}

function parseInput(input) {
  return input.trimEnd().split(',').map(x => +x);
}

class HullPaintingRobot {
  constructor(startingColor = HullPaintingRobot.COLOR.BLACK) {
    this.position = { x: 0, y: 0 };
    this.heading = HullPaintingRobot.HEADINGS.UP;

    this.history = new GridMap();
    this.history.set({x: 0, y: 0}, startingColor);
  }

  async initializeComputer(program) {
    const computer = new Intcode(program);
    this.cpu = await computer.sprint();
  }

  async paint() {
    // log.debug(`Painting ${p2s(this.position)} (facing ${p2s(this.heading)}):`);
    const currentSquareColor = this.history.get(this.position) ? 1 : 0;
    // log.debug(`  currently ${currentSquareColor ? 'white' : 'black'} (${currentSquareColor})`);

    const colorResult = await this.cpu.next([currentSquareColor]);
    if(colorResult.done) {
      return false;
    }
    this.history.set(this.position, colorResult.value);
    // log.debug(`  painting it ${colorResult.value ? 'white' : 'black'} (${colorResult.value})`);

    const turnResult = await this.cpu.next();
    // log.debug(`  turning ${turnResult.value ? 'clockwise' : 'counter'} (${turnResult.value})`);
    this.turn(turnResult.value);

    this.position.x = this.position.x + this.heading.x;
    this.position.y = this.position.y + this.heading.y;
    // log.debug(`  stepping forward onto ${p2s(this.position)}`);
    // log.debug('');

    return true;
  }

  turn(clockwise) {
    switch(this.heading) {
      case HullPaintingRobot.HEADINGS.UP:
        this.heading = clockwise ? HullPaintingRobot.HEADINGS.RIGHT : HullPaintingRobot.HEADINGS.LEFT;
        break;
      case HullPaintingRobot.HEADINGS.RIGHT:
        this.heading =  clockwise ? HullPaintingRobot.HEADINGS.DOWN : HullPaintingRobot.HEADINGS.UP;
        break;
      case HullPaintingRobot.HEADINGS.DOWN:
        this.heading =  clockwise ? HullPaintingRobot.HEADINGS.LEFT : HullPaintingRobot.HEADINGS.RIGHT;
        break;
      case HullPaintingRobot.HEADINGS.LEFT:
        this.heading =  clockwise ? HullPaintingRobot.HEADINGS.UP : HullPaintingRobot.HEADINGS.DOWN;
        break;
    }
  }

  showImage() {
    const pixels = this.history.keys();
    const xs = pixels.map(c => c.x);
    const ys = pixels.map(c => c.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    let output = '';
    for(let y = maxY; y >= minY; --y) { // the y-axis actually points up this time!
      for(let x = minX; x <= maxX; ++x) {
        output += this.history.get({x, y}) ? '█' : ' ';
      }

      output += '\n';
    }

    return output;
  }

  static HEADINGS = {
    UP:     { x: 0, y: 1 },
    RIGHT:  { x: 1, y: 0 },
    DOWN:   { x: 0, y: -1 },
    LEFT:   { x: -1, y: 0 },
  };

  static COLOR = {
    BLACK: 0,
    WHITE: 1,
  };
}

function p2s(pt) {
  return `(${pt.x}, ${pt.y})`;
}

export default { part1, part2 };
