import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { isNumeric, product, sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  let monkeys = parseInput(input);

  const NUMBER_OF_ROUNDS = 20;
  for(let round = 0; round < NUMBER_OF_ROUNDS; ++round) {
    doARoundOfMonkeyBusiness(monkeys);
  }

  log.debug(formatMonkeyHoldings(monkeys, NUMBER_OF_ROUNDS));

  monkeys = monkeys.sort((a, b) => b.inspectionCount - a.inspectionCount);
  const monkeyBusinessLevel = monkeys[0].inspectionCount * monkeys[1].inspectionCount;

  return Number(monkeyBusinessLevel);
}

async function* part2(input, options = {}) {
  let monkeys = parseInput(input);

  const NUMBER_OF_ROUNDS = 10000;
  for(let round = 1; round <= NUMBER_OF_ROUNDS; ++round) {
    doARoundOfMonkeyBusiness(monkeys, false);

    if(round % 1000 === 0 || round === 1 || round === 20) {
      log.debug(formatMonkeyInspections(monkeys, round));
    }
  }

  log.debug(formatMonkeyInspections(monkeys, NUMBER_OF_ROUNDS));

  monkeys = monkeys.sort((a, b) => b.inspectionCount - a.inspectionCount);
  const monkeyBusinessLevel = monkeys[0].inspectionCount * monkeys[1].inspectionCount;

  return Number(monkeyBusinessLevel);
}

/*
Monkey 0:
  Starting items: 97, 81, 57, 57, 91, 61
  Operation: new = old * 7
  Test: divisible by 11
    If true: throw to monkey 5
    If false: throw to monkey 6
*/
function parseInput(input) {
  const monkeys = input.trim().split('\n\n').map(monkey => {
    const [ idLine, itemsLine, operationLine, testLine, trueLine, falseLine ] = monkey.split('\n');

    const id = +idLine[7]; // there are fewer than 10 monkeys in the input, so we can just pull the single char
    const items = itemsLine.slice('  Starting items: '.length).split(', ').map(x => +x);
    const opParts = operationLine.slice('  Operation: new = '.length).split(' ').map(x => isNumeric(x) ? +x : x);
    const test = +testLine.slice('  Test: divisible by '.length);
    const trueDest = +trueLine.slice('    If true: throw to monkey '.length);
    const falseDest = +falseLine.slice('    If false: throw to monkey '.length);

    return {
      id,
      items,
      operation: { symbol: opParts[1], args: [ opParts[0], opParts[2] ] },
      test, trueDest, falseDest,
      inspectionCount: 0,
    };
  });

  return monkeys;
}

function doARoundOfMonkeyBusiness(monkeys, takeAChillPill = true, debug = false) {
  const monkeyLcm = product(monkeys.map(m => m.test));

  for(let monkey of monkeys) {
    debug && log.debug(`Monkey ${monkey.id}:`);
    while(monkey.items.length > 0) {
      let item = monkey.items.shift();
      debug && log.debug(`  Monkey inspects an item with a worry level of ${item}.`);

      item = doMonkeyOperation(item, monkey.operation)
      debug && log.debug(`    Worry level ${monkey.operation.symbol === '*' ? 'is multiplied by' : 'increases'} by ${monkey.operation.args[1] === 'old' ? 'itself' : monkey.operation.args[1]} to ${item}.`);

      if(takeAChillPill) {
        item = Math.floor(item / 3);
        debug && log.debug(`    Monkey gets bored with item. Worry level is divided by 3 to ${item}.`);
      } else {
        item = item % monkeyLcm;
        debug && log.debug(`    Monkey gets bored with item. Worry level is mod'd by Monkey GCD (${monkeyLcm}) to ${item}.`);
      }

      const passesTest = item % monkey.test === 0;
      debug && log.debug(`    Current worry level ${passesTest ? 'is' : 'is not'} divisible by ${monkey.test}.`)

      monkeys[passesTest ? monkey.trueDest : monkey.falseDest].items.push(item);
      debug && log.debug(`    Item with worry level ${item} is thrown to monkey ${passesTest ? monkey.trueDest : monkey.falseDest}.`);

      monkey.inspectionCount++;
    }
  }
}

function doMonkeyOperation(item, operation) {
  const args = operation.args.map(arg => arg === 'old' ? item : arg);

  if(operation.symbol === '+') {
    return sum(args);
  } else if(operation.symbol === '*') {
    return product(args);
  } else {
    throw new Error(`Unknown monkey operation ${operation.symbol}: ${operation}`);
  }
}

function formatMonkeyHoldings(monkeys, roundNumber = '?') {
  return [
    `After round ${roundNumber}, the monkeys are holding items with these worry levels:`,
    ...monkeys.map(monkey => `Monkey ${monkey.id}: ${monkey.items.join(', ')}`)
  ].join('\n');
}

function formatMonkeyInspections(monkeys, roundNumber = '?') {
  return [
    `== After round ${roundNumber} ==`,
    ...monkeys.map(monkey => `Monkey ${monkey.id} inspected items ${monkey.inspectionCount} times.`)
  ].join('\n');
}

export default { part1, part2 };
