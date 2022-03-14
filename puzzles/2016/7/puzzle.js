import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { uniquify } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const ips = parseInput(input);
  const ipsThatSupportTls = ips.filter(supportsTls);

  return ipsThatSupportTls.length;
}

async function* part2(input, options = {}) {
  const ips = parseInput(input);
  const ipsThatSupportSsl = ips.filter(supportsSsl);

  return ipsThatSupportSsl.length;
}

function parseInput(input) {
  return input.trim().split('\n');
}

function parseIp(ip) {
  const supernetSequences = [];
  const hypernetSequences = [];

  let cursor = 0;
  let inHypernetSequence = false;
  while(cursor < ip.length) {
    let nextBracket = ip.indexOf(inHypernetSequence ? ']' : '[', cursor);
    if(nextBracket < 0 ) { nextBracket = ip.length; }
    const sequence = ip.substring(cursor, nextBracket);
    if(inHypernetSequence) {
      hypernetSequences.push(sequence);
    } else {
      supernetSequences.push(sequence);
    }
    inHypernetSequence = !inHypernetSequence;
    cursor = nextBracket + 1; // +1 to skip the bracket
  }

  return {
    supernet: supernetSequences,
    hypernet: hypernetSequences
  };
}

function supportsTls(ip) {
  const sequences = parseIp(ip);
  return sequences.supernet.some(hasAbba) && !sequences.hypernet.some(hasAbba);
}

const ABBA_REGEX = /([a-z])([a-z])\2\1/;
function hasAbba(str) {
  const matches = ABBA_REGEX.exec(str);
  return !!(matches && matches[2] !== matches[1]);
}

function supportsSsl(ip) {
  const sequences = parseIp(ip);
  const abas = sequences.supernet.flatMap(findAbas);
  return hasBabs(sequences.hypernet, abas);
}

let ABA_REGEX = /([a-z])(?!\1)(?=[a-z]\1)/g;
function findAbas(str) {
  const matches = [...str.matchAll(ABA_REGEX)];
  if(matches) {
    return uniquify(matches.map(match => str.substr(match.index, 3)));
  } else {
    return [];
  }
}

function hasBabs(strs, abas) {
  if(abas.length <= 0) { return false; }

  for(let aba of abas) {
    const bab = aba2bab(aba);
    for(let str of strs) {
      if(str.indexOf(bab) >= 0) {
        return true;
      }
    }
  }

  return false;
}

function aba2bab(aba) {
  const [ a, b ] = aba.split(''); // discard the third character
  return b + a + b;
}

export default { part1, part2 };
