import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Intcode } from '../common/intcode.js';
import { chunk } from '#utils/arr';
import { GridMap } from '#utils/grid';
import delay from '#lib/delay';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const program = parseInput(input);

  const mame = new ArcadeCabinet(program);
  await mame.start();

  yield frame(mame.render(), 'GAME OVER');
  const blockTileCount = mame.render().split('').filter(el => el === ArcadeCabinet.TILE_SPRITE[2]).length;

  return blockTileCount;
}

async function* part2(input, options = {}) {
  const program = parseInput(input);

  const mame = new ArcadeCabinet(program);
  // mame.putInQuarters(2);

  mame.start();
  while(!mame.isGameOver()) {
    // yield frame(mame.render(), mame.score());
    log.debug('render', mame.isGameOver());
    await delay(100);
  }

  // yield frame(mame.render(), mame.score());
  log.debug('render2', mame.isGameOver());

  return mame.score();
}

function parseInput(input) {
  return input.trimEnd().split(',').map(x => +x);
}

class ArcadeCabinet {
  static SCREEN_WIDTH = 39;
  static SCREEN_HEIGHT = 20;

  constructor(program) {
    this.screen = Array(ArcadeCabinet.SCREEN_HEIGHT + 1).fill(0).map(el => Array(ArcadeCabinet.SCREEN_WIDTH + 1).fill(ArcadeCabinet.TILE_SPRITE[0]));
    this.screenBuffer = [];

    this._score = 0;

    this._isGameOver = false;
    this.cpu = new Intcode(program, this, this);
  }

  putInQuarters(n = 0) {
    this.cpu.memory[0] = n;
  }

  async start() {
    log.debug('start');
    const haltPromise = this.cpu.run();
    log.debug('running');

    haltPromise
      .then(() => {
        log.debug('halted?', this.cpu.flags);
        this._isGameOver = true;
      })
      .catch(err => console.error(err));

    log.debug('returning');
    return haltPromise;
  }

  isGameOver() {
    return this._isGameOver;
  }

  read() {
    return 0; // for now, no joystick entry
  }

  write(val) {
    this.screenBuffer.push(val);

    if(this.screenBuffer.length === 3) {
      const [ x, y, tile ] = this.screenBuffer;
      if(x >= 0 && y >= 0) {
        this.screen[y][x] = ArcadeCabinet.TILE_SPRITE[tile];
        this.screenBuffer = [];
      } else {
        this._score = tile;
      }
    }
  }

  render() {
    return this.screen.map(line => line.join('')).join('\n') + '\n';
  }

  score() {
    return this._score;
  }

  static TILE_SPRITE = {
    0: ' ', // empty
    1: '#', // wall
    2: '@', // block
    3: '_', // paddle
    4: '*', // ball
  };
}

export default { part1, part2 };
