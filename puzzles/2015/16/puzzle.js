import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

async function part1(input, options = {}) {
  const sues = parseInput(input);

  const analysis = {
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1,
  };

  return matchSue(analysis, sues)[0];
}

async function part2(input, options = {}) {
  const sues = parseInput(input);

  const analysis = {
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1,
  };

  return matchSue2(analysis, sues)[0];
}

function parseInput(input) {
  return input.trim().split('\n').map(line => {
    const number = +/^Sue (\d+):/.exec(line)[1];
    const properties = line.replace(/^Sue \d+: /, '').split(', ').reduce((obj, prop) => {
      const [ key, val ] = prop.split(': ');
      obj[key] = +val;
      return obj;
    }, {});

    return { number, properties };
  });
}

function matchSue(analysis, sues) {
  const suespects = sues.filter(sue => {
    return Object.keys(sue.properties).every(prop => sue.properties[prop] === analysis[prop]);
  });

  return suespects.map(sue => sue.number);
}

function matchSue2(analysis, sues) {
  const suespects = sues.filter(sue => {
    return Object.keys(sue.properties).every(prop => {
      switch(prop) {
        case 'cats':
        case 'trees':
          return sue.properties[prop] > analysis[prop];
        case 'pomeranians':
        case 'goldfish':
          return sue.properties[prop] < analysis[prop];
        default:
          return sue.properties[prop] === analysis[prop]
      }
    });
  });

  return suespects.map(sue => sue.number);
}

export default { part1, part2 };
