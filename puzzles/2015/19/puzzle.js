import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { uniquify, shuffle } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { rules, molecule } = parseInput(input);

  const replacements = runReplacements(rules, molecule);

  return replacements.length;
}

async function* part2(input, options = {}) {
  let { rules, molecule } = parseInput(input);
  // reverse the rules for reverse engineering
  rules = rules.map(rule => ({ before: rule.after, after: rule.before }));

  let medicine = molecule;
  let steps = 0;

  const TARGET_MOLECULE = 'e';
  while(medicine !== TARGET_MOLECULE) {
    let changeMade = false;
    for(let rule of rules) {
      const REPLACE_REGEX = new RegExp(rule.before, 'g');
      const numberOfReplacements = Array.from(medicine.matchAll(REPLACE_REGEX)).length;
      if(numberOfReplacements > 0) {
        medicine = medicine.replaceAll(rule.before, rule.after);
        changeMade = true;
        steps += numberOfReplacements;

        break;
      }
    }

    if(changeMade === false) {
      // screw this rules order, start over with a different rules order
      log.info('Screw this, starting over with a different order...');
      rules = shuffle(rules);
      changeMade = false;
      steps = 0;
      medicine = molecule;
      continue;
    }
  }

  return steps;
}

function parseInput(input) {
  const lines = input.trim().split('\n');
  const molecule = lines.pop();

  // there's a blank line above the molecule line, so let's get rid of it
  lines.pop();

  const rules = lines.map(line => {
    const [ before, after ] = line.split(' => ');
    return { before, after };
  });

  return {
    rules,
    molecule
  };
}

function runReplacements(rules, molecule) {
  const nextMolecules = [];
  for(let rule of rules) {
    if(molecule.includes(rule.before)) {
      nextMolecules.push(...useRuleOnMolecule(rule, molecule));
    }
  }

  // log.info(uniquify(nextMolecules));
  return uniquify(nextMolecules);
}

function useRuleOnMolecule(rule, molecule) {
  const RULE_REGEX = new RegExp(rule.before, 'g');
  const replacements = Array.from(molecule.matchAll(RULE_REGEX))
    .map(match => molecule.substring(0, match.index) + molecule.substring(match.index).replace(rule.before, rule.after));

  // log.info(rule, molecule, replacements);
  return replacements;
}

export default { part1, part2 };
