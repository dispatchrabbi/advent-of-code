import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { isNumeric } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const monkeys = parseInput(input);

  const result = solveMonkeyRiddle1(monkeys);

  return result;
}

async function* part2(input, options = {}) {
  const monkeys = parseInput(input);

  const result = solveMonkeyRiddle2(monkeys);

  return result;
}

function parseInput(input) {
  return input.trim().split('\n').reduce((monkeys, line) => {
    let [ name, yell ] = line.split(': ');

    if(isNumeric(yell)) {
      yell = +yell;
    } else {
      yell = { operation: yell.substr(5, 1), operands: [ yell.substr(0, 4), yell.substr(7, 4) ] }
    }

    monkeys[name] = yell;
    return monkeys;
  }, {});
}

function solveMonkeyRiddle1(monkeys, startingMonkeyName = 'root') {
  const instructionStack = [];
  pushMonkey(monkeys[startingMonkeyName], instructionStack);

  return processInstructions(monkeys, instructionStack);
}

function solveMonkeyRiddle2(monkeys, startingMonkeyName = 'root') {
  monkeys[startingMonkeyName].operation = '=';
  monkeys['humn'] = 'X';

  const instructionStack = [];
  pushMonkey(monkeys[startingMonkeyName], instructionStack);

  return processInstructions(monkeys, instructionStack);
}

function processInstructions(monkeys, instructionStack) {
  const dataStack = [];

  while(instructionStack.length > 0) {
    // log.debug('\n');
    // log.debug(instructionStack);
    // log.debug(dataStack);
    const monkey = instructionStack.pop();
    const popped = monkey;

    if(isNumeric(popped) || popped === 'X' || Array.isArray(popped)) {
      dataStack.push(popped);
    } else if('+-*/'.includes(popped)) {
      // do an operation
      const a = dataStack.pop();
      const b = dataStack.pop();

      const result = operate(popped, [ a, b ]);
      instructionStack.push(result);
    } else if(popped === '=') {
      // initiate weird X-solving algorithm
      const a = dataStack.pop();
      const b = dataStack.pop();

      const result = solveForX(...(Array.isArray(a) ? [a, b] : [b, a]));
      instructionStack.push(result);
    } else if(popped.length === 4) {
      // it's a monkey name
      const monkeyYell = monkeys[popped];
      pushMonkey(monkeyYell, instructionStack);
    } else {
      throw new Error(`No clue what to do with ${popped}`);
    }
    // log.debug('is now');
    // log.debug(instructionStack);
    // log.debug(JSON.stringify(dataStack));
  }

  return dataStack[0];
}

function pushMonkey(monkeyYell, stack) {
  if(monkeyYell.operation) {
    stack.push(monkeyYell.operation, ...monkeyYell.operands);
  } else {
    stack.push(monkeyYell);
  }
}

function operate(operation, [ a, b ]) {
  if(a === 'X' || b === 'X' || Array.isArray(a) || Array.isArray(b)) {
    return [operation, a, b];
  }

  let result = null;

  switch(operation) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '*':
      result = a * b;
      break;
    case '/':
      result = a / b;
      break;
    default:
      throw new Error(`Unknown operation (${operation}): ${operation} ${a} ${b}`);
  }

  return result;
}

function solveForX(nested, number) {
  if(nested === 'X') {
    return number;
  }

  let [ operation, unknown, operand ] = nested;
  let unknownFirst = true;
  if(Array.isArray(operand) || operand === 'X') {
    unknownFirst = false;
    [ unknown, operand ] = [ operand, unknown ];
  }

  switch(operation) {
    case '+':
      number = number - operand;
      break;
    case '-':
      number = unknownFirst ? number + operand : operand - number;
      break;
    case '*':
      number = number / operand;
      break;
    case '/':
      number = unknownFirst ? number * operand : operand / number;
      break;
    default:
      throw new Error(`Unknown operation (${operation}): ${operation} ${a} ${b}`);
  }

  return solveForX(unknown, number);
}

export default { part1, part2 };
