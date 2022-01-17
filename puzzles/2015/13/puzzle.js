import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { permute } from '#utils/arr';

async function part1(input) {
  const { people, preferences } = parseInput(input);

  const arrangements = permute(people);
  const highestScore = arrangements.reduce((leader, arrangement) => Math.max(leader, scoreSeatingArrangement(arrangement, preferences)), -Infinity);

  return highestScore;
}

async function part2(input) {
  const { people, preferences } = parseInput(input);

  // add yourself
  const YOU = 'You';
  for(let person of people) {
    preferences.push({ subject: YOU, neighbor: person, change: 0 });
    preferences.push({ subject: person, neighbor: YOU, change: 0 });
  }
  people.push(YOU);

  const arrangements = permute(people);
  const highestScore = arrangements.reduce((leader, arrangement) => Math.max(leader, scoreSeatingArrangement(arrangement, preferences)), -Infinity);

  return highestScore;
}

function parseInput(input) {
  const lines = input.trim().split('\n');

  const people = new Set([]);
  const preferences = [];

  const PREFERENCE_REGEX = /^(\w+) would (gain|lose) (\d+) happiness units by sitting next to (\w+).$/;
  for(let line of lines) {
    const [ _, subject, valence, change, neighbor ] = PREFERENCE_REGEX.exec(line);

    people.add(subject);
    people.add(neighbor);
    preferences.push({
      subject,
      neighbor,
      change: (+change) * (valence === 'lose' ? -1 : 1),
    });
  }

  return { people: [...people], preferences };
}

function scoreSeatingArrangement(arrangement, preferences) {
  let runningTotal = 0;

  for(let i = 0; i < arrangement.length; ++i) {
    const subject = arrangement[i];

    const left = arrangement[i+1 >= arrangement.length ? 0 : i+1];
    runningTotal += scoreNeighbors(preferences, subject, left);

    const right = arrangement[i-1 < 0 ? arrangement.length - 1 : i-1];
    runningTotal += scoreNeighbors(preferences, subject, right);
  }

  return runningTotal;
}

function scoreNeighbors(preferences, subject, neighbor) {
  return preferences.filter(pref => pref.subject === subject && pref.neighbor === neighbor)[0].change;
}

export default { part1, part2 };
