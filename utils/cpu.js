import chalk from "chalk";

import { isNumeric } from "#utils/maths";
import { isFunction } from "#lib/is-function";

class CPU {
  constructor(operations = { noop: (args, cpu) => { } }, registers = {}, instructions = []) {
    this.operations = operations;
    this.registers = registers;
    this.instructions = instructions;

    this.counter = 0;
    this.flags = this.resetFlags();
  }

  resetFlags() {
    return {
      jump: false,
      halt: false,
    }
  }

  val(registerOrLiteral, isLiteral = isNumeric) {
    return isLiteral(registerOrLiteral) ? registerOrLiteral : (this.registers[registerOrLiteral] || 0);
  }

  async run() {
    this.flags = this.resetFlags();

    while(!this.flags.halt) {
      await this._step();
    }
  }

  _counterInBounds() {
    return this.counter >= 0 && this.counter < this.instructions.length;
  }

  async _step() {
    this.flags = this.resetFlags();

    const instruction = this._getInstruction();
    const operation = this._getOperation(instruction);
    if(!isFunction(operation)) { throw new Error(`Unknown opcode ${instruction.opcode}: ${instruction}`); }

    await operation(instruction.args, this);

    if(!(this.flags.jump || this.flags.halt)) {
      this.counter++;
    }
    if(!this._counterInBounds) {
      this.flags.halt = true;
    }
  }

  _getInstruction() {
    return this.instructions[this.counter];
  }

  _getOperation(instruction) {
    return this.operations[instruction.opcode];
  }

  statusString() {
    const instr = this._getInstruction();
    const counter = `#${this.counter} (${instr.opcode} ${instr.args.join(', ')})`;
    const flags = Object.keys(this.flags).map(flag => this.flags[flag] ? chalk.yellow(flag) : chalk.gray(flag)).join('|');
    const registers = Object.entries(this.registers).map(([key, val]) => `${key}: ${val}`).join(', ');
    return [counter, flags, registers].join('\n');
  }

  static makeInstruction(opcode, ...args) {
    return {
      opcode,
      args: args.map(arg => isNumeric(arg) ? +arg : arg),
    };
  }
}

export {
  CPU
};
