import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { uniquify } from '#utils/arr';

async function part1(input) {
  let password = parseInput(input);

  do {
    password = incrementString(password);
  } while(!validatePassword(password));

  return password;
}

async function part2(input) {
  const once = await part1(input);
  const twice = await part1(once);

  return twice;
}

function parseInput(input) {
  return input.trim();
}

const Z_CHAR_CODE = 0x7a;
function incrementString(str) {
  const incrementedStr = str.split('');
  for(let i = incrementedStr.length - 1; i >= 0; --i) {
    const charCode = incrementedStr[i].charCodeAt(0);
    if(charCode === Z_CHAR_CODE) {
      incrementedStr[i] = 'a';
      // keep going
    } else {
      incrementedStr[i] = String.fromCharCode(charCode + 1);
      break;
    }
  }

  return incrementedStr.join('');
}

const CONFUSING_LETTER_REGEX = /[iol]/;
const DOUBLE_LETTER_REGEX = /([a-z])\1/g;
function validatePassword(password) {
  const validations = {
    noConfusingLetters: false,
    twoDoubleLetters: false,
    ascendingRun: false,
  };

  // must not have i, o, or l
  validations.noConfusingLetters = !CONFUSING_LETTER_REGEX.test(password);

  // must have 2 different double letters
  const matches = [...password.matchAll(DOUBLE_LETTER_REGEX)].map(match => match[0]);
  validations.twoDoubleLetters = uniquify(matches).length >= 2;

  // must have one run of 3 ascending letters
  const codes = password.split('').map(char => char.charCodeAt(0));
  for(let i = 0; i < codes.length - 2; ++i) {
    if(
      codes[i] + 1 === codes[i + 1] &&
      codes[i + 1] + 1 === codes[i + 2]
    ) {
      validations.ascendingRun = true;
      break;
    }
  }

  return validations.noConfusingLetters && validations.twoDoubleLetters && validations.ascendingRun;
}

export default { part1, part2 };
