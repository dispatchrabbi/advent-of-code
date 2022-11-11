import chalk from 'chalk';
import { LiveArea } from 'clui-live';
import prettyMilliseconds from 'pretty-ms';

import { deepEquals } from '#utils/obj';

class ConsoleRenderer {
  constructor(state) {
    this._state = state;
  }

  open(pin = false) {
    this._area = new LiveArea().hook();

    if(pin) {
      this._area.pin();
    }
  }

  close() {
    this._area.close();
  }

  update(val) {
    this._state.update(val);
    this.render();
  }

  render() {
    this._area.write(this._state.format());
  }
}

class AttemptState {
  constructor(name, isTest = false, expected = null) {
    this._state = {
      name,
      isTest,
      isPass: null,
      result: null,
      expected,
      elapsed: null,
      message: 'Running...',
    };
  }

  update(val) {
    this.message = val;
  }

  set message(val) {
    this._state.message = val.toString();
  }

  finish(result, elapsed) {
    this._state.result = result;
    this._state.elapsed = elapsed;
    if(this.expected !== null) {
      this._state.isPass = deepEquals(result, this._state.expected);
    }
    this._state.message = 'Done!';
  }

  format() {
    let icon = this._state.isTest ? '🧪' : '🧮';
    let color = 'white';
    let message = this._state.message;
    let time = '';

    if(this._state.elapsed) {
      if(this._state.isTest) {
        if(this._state.isPass === true) {
          icon = '✅';
          color = 'green';
          message = `PASS! The result is: ${chalk.white.bold(this._state.result)}`;
        } else if(this._state.isPass === false) {
          icon = '❌';
          color = 'redBright';
          message = `FAIL. Expected ${chalk.white.bold(this._state.expected)} but got ${chalk.white.bold(this._state.result)}.`;
        } else {
          icon = '🎱';
          color = 'magenta';
          message = `TADA! The result is: ${chalk.white.bold(this._state.result)}`;
        }
      } else {
        icon = '⭐️';
        color = 'blue';
        message = `The result is: ${chalk.white.bold(this._state.result)}`;
      }

      time = ` (${chalk.yellow(prettyMilliseconds(this._state.elapsed, {formatSubMilliseconds: true}))})`;
    }

    return chalk[color](`${icon} ${this._state.name} | ${message}${time}`);
  }
}

class AnimationState {
  constructor() {
    this._frame = '';
  }

  update(val) {
    this.frame = val;
  }

  set frame(val) {
    this._frame = val.toString();
  }

  format() {
    return this._frame;
  }
}

function frame(frame, msg) {
  return { frame, msg };
}

export {
  ConsoleRenderer,
  AttemptState,
  AnimationState,
  frame,
};
