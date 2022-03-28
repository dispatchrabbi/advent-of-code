import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { target: [ 17, 61 ] }) {
  const { takes, rules } = parseInput(input);
  const { comparisons } = simulateRobotFloor(takes, rules);

  const [ low, high ] = options.target.sort((a, b) => a - b);
  const targetComparison = comparisons.filter(c => c.low === low && c.high === high)[0];
  return targetComparison.bot;
}

async function* part2(input, options = {}) {
  const { takes, rules } = parseInput(input);
  const { outputs } = simulateRobotFloor(takes, rules);

  return outputs[0].chips[0] * outputs[1].chips[0] * outputs[2].chips[0];
}

function parseInput(input) {
  const TAKE_REGEX = /^value (\d+) goes to bot (\d+)$/;
  const RULE_REGEX = /^bot (\d+) gives low to (bot|output) (\d+) and high to (bot|output) (\d+)$/;

  const instructions = input.trim().split('\n').map(line => {
    if(line.startsWith('value')) {
      const matches = TAKE_REGEX.exec(line);
      return {
        type: 'take',
        bot: +matches[2],
        chip: +matches[1],
      };
    } else if(line.startsWith('bot')) {
      const matches = RULE_REGEX.exec(line);
      return {
        type: 'rule',
        bot: +matches[1],
        low: { destination: matches[2], number: +matches[3] },
        high: { destination: matches[4], number: +matches[5] },
      };
    }
  });

  return {
    takes: instructions.filter(i => i.type === 'take'),
    rules: instructions.filter(i => i.type === 'rule'),
  };
}

class Bot {
  constructor(rule) {
    this.number = rule.bot;
    this.rule = rule;
    this.chips = [];
  }

  takeChip(chip) {
    if(this.chips.length >= 2) {
      throw new Error(`Bot ${this.number} attempted to take a third chip (${chip}). Current chips: ${this.chips.join(', ')}`);
    }

    this.chips.push(chip);
  }

  canExecuteRule() {
    return this.chips.length === 2;
  }

  executeRule(bots, outputs) {
    if(!this.canExecuteRule()) { return null; }

    const [ low, high ] = this.chips.sort((a, b) => a - b);

    if(this.rule.low.destination === 'output') {
      outputs[this.rule.low.number].takeChip(low);
    } else {
      bots[this.rule.low.number].takeChip(low);
    }

    if(this.rule.high.destination === 'output') {
      outputs[this.rule.high.number].takeChip(high);
    } else {
      bots[this.rule.high.number].takeChip(high);
    }

    this.chips = [];

    return {
      bot: this.number,
      low, high
    };
  }

  static makeAllBots(rules) {
    return rules.reduce((bots, rule) => {
      bots[rule.bot] = new Bot(rule);
      return bots;
    }, {});
  }

  static getBotToAct(bots) {
    return Object.values(bots).filter(bot => bot.canExecuteRule())[0];
  }
}

class Output {
  constructor(number) {
    this.number = number;
    this.chips = [];
  }

  takeChip(chip) {
    this.chips.push(chip);
  }

  static makeAllOutputs(rules) {
    return rules.reduce((outputs, rule) => {
      if(rule.low.destination === 'output') { outputs[rule.low.number] = new Output(rule.low.number); }
      if(rule.high.destination === 'output') { outputs[rule.high.number] = new Output(rule.high.number); }

      return outputs;
    }, {});
  }
}

function simulateRobotFloor(takes, rules) {
  const bots = Bot.makeAllBots(rules);
  const outputs = Output.makeAllOutputs(rules);
  const comparisons = [];

  for(let take of takes) {
    bots[take.bot].takeChip(take.chip);
  }

  let botToAct = null;
  while(botToAct = Bot.getBotToAct(bots)) {
    const comparison = botToAct.executeRule(bots, outputs);
    comparisons.push(comparison);
  }

  return { bots, outputs, comparisons };
}

export default { part1, part2 };
