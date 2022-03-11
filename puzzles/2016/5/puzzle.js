import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import crypto from 'crypto';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const doorId = parseInput(input);

  yield frame('••••••••', 'Decrypting...');
  const searchGenerator = searchForCode(doorId, false);
  let result = searchGenerator.next();
  while(!result.done) {
    yield frame(result.value.map(el => el === null ? '•' : el).join(''), 'Decrypting...');
    result = searchGenerator.next();
  }

  yield frame(result.value.map(el => el === null ? '•' : el).join(''), 'Decrypting...');
  return result.value.join('');
}

async function* part2(input, options = {}) {
  const doorId = parseInput(input);

  yield frame('••••••••', 'Decrypting...');
  const searchGenerator = searchForCode(doorId, true);
  let result = searchGenerator.next();
  while(!result.done) {
    yield frame(result.value.map(el => el === null ? '•' : el).join(''), 'Decrypting...');
    result = searchGenerator.next();
  }

  yield frame(result.value.map(el => el === null ? '•' : el).join(''), 'Decrypting...');
  return result.value.join('');
}

function parseInput(input) {
  return input.trim();
}

function* searchForCode(doorId, positional = false) {
  const code = Array(8).fill(null);

  for(let i = 0; true; ++i) {
    const hash = crypto.createHash('md5').update(`${doorId}${i}`).digest('hex');
    if(hash.startsWith('00000')) {
      if(positional) {
        // ignore invalid positions and only take the first value
        if(+hash[5] < code.length && code[+hash[5]] === null) {
          code[+hash[5]] = hash[6];
        }
      } else {
        code[code.findIndex(el => el === null)] = hash[5];
      }

      if(code.filter(el => el === null).length === 0) {
        return code;
      } else {
        yield code;
      }
    }
  }
}

export default { part1, part2 };
