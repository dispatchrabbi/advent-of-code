import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { product, sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const GOAL = { red: 12, green: 13, blue: 14 };

  const games = parseInput(input);
  games.forEach(game => game.mins = game.shows.reduce((mins, show) => ({
    red: Math.max(mins.red, show.red),
    green: Math.max(mins.green, show.green),
    blue: Math.max(mins.blue, show.blue),
  })));

  const possibleGames = games.filter(game => (
    game.mins.red <= GOAL.red &&
    game.mins.green <= GOAL.green &&
    game.mins.blue <= GOAL.blue
  ));
  return sum(possibleGames.map(game => game.id));
}

async function* part2(input, options = {}) {
  const games = parseInput(input);
  games.forEach(game => game.mins = game.shows.reduce((mins, show) => ({
    red: Math.max(mins.red, show.red),
    green: Math.max(mins.green, show.green),
    blue: Math.max(mins.blue, show.blue),
  })));

  return sum(games.map(game => product(Object.values(game.mins))));
}

function parseInput(input) {
  const LINE_REGEX = /^Game (\d+): (.*)$/;
  const SHOW_REGEX = /(\d+) (red|green|blue)/g;

  return input.trimEnd().split('\n').map(line => {
    const result = LINE_REGEX.exec(line);
    const id = +result[1];
    const shows = result[2].split('; ').map(show => {
      const colors = { red: 0, green: 0, blue: 0 };
      Array.from(show.matchAll(SHOW_REGEX)).forEach(match => colors[match[2]] = +match[1]);
      return colors;
    });

    return { id, shows };
  });
}

export default { part1, part2 };
