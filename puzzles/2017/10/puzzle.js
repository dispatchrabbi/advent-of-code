import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { listLength: 256 }) {
  const swaps = parseInput(input).split(',').map(x => +x);

  let list = Array(options.listLength).fill(0).map((el, ix) => ix);
  list = knotHashRound(swaps, list).list;

  return list[0] * list[1];
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  const hashed = knotHash(parsed);

  return hashed;
}

function parseInput(input) {
  return input.trim();
}

function knotHash(input) {
  const STANDARD_KNOTHASH_SWAP_SUFFIX = [17, 31, 73, 47, 23];

  // convert each character into its ASCII code to get a list of swaps
  // then add the standard swap suffix
  const swaps = [...Buffer.from(input).values(), ...STANDARD_KNOTHASH_SWAP_SUFFIX];

  // perform 64 rounds of knothash on the 0-255 list to get the sparse hash
  let hashState = {
    list: Array(256).fill(0).map((el, ix) => ix),
    cursor: 0,
    skip: 0,
  };
  for(let round = 0; round < 64; ++round) {
    hashState = knotHashRound(swaps, hashState.list, hashState.cursor, hashState.skip);
  }

  // transform the sparse hash into the dense hash by XORing each set of 16 numbers
  const sparseHash = hashState.list;
  const denseHash = [];
  for(let chunk = 0; chunk < 16; ++chunk) {
    denseHash.push(sparseHash.slice(chunk * 16, (chunk * 16) + 16).reduce((result, el) => result ^ el));
  }

  // convert the dense hash to a hex string and output it
  return Buffer.from(denseHash).toString('hex');
}

function knotHashRound(swaps, list, cursor = 0, skip = 0) {
  for(let swap of swaps) {
    log.debug(formatList(list, cursor), { skip, cursor, swap });
    list = executeSwap(list, cursor, swap);
    cursor = (cursor + swap + skip) % list.length;
    skip++;
  }

  log.debug(formatList(list, cursor), { skip, cursor });
  return { list, cursor, skip };
}

function executeSwap(list, offset, length) {
  log.debug(formatList(list, offset, length));

  let sublist = [];
  for(let i = offset; i < offset + length; ++i) {
    sublist.push(list[i % list.length]);
  }

  sublist = sublist.reverse();

  for(let j = 0; j < sublist.length; ++j) {
    list[(offset + j) % list.length] = sublist[j];
  }

  log.debug(formatList(list, offset, length));
  return list;
}

function formatList(list, cursor, length) {
  const formattedList = list.map((el, ix) => {
    let out = el;
    if(cursor !== undefined && ix === cursor) { out = `[${out}]`; }
    if(length !== undefined && ix === cursor) { out = `(${out}`; }
    if(length !== undefined && ix === ((cursor + length - 1) % list.length)) { out = `${out})`; }
    return out;
  });

  return formattedList.join(' ');
}

export default { part1, part2 };
