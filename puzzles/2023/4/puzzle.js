import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { ints } from '#utils/parse';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const tickets = parseInput(input);
  const matches = tickets.map(({ winners, candidates }) => {
    // can't have more matches than winning numbers
    return winners.filter(w => candidates.includes(w)).length;
  });

  // 0 points for no matches, 1 for 1 match, doubled for every match thereafter
  return sum(matches.map(m => m > 0 ? 2 ** (m - 1) : 0));
}

async function* part2(input, options = {}) {
  const tickets = parseInput(input);

  const ticketCounts = tickets.map(({ winners, candidates }) => ({
    matches: winners.filter(w => candidates.includes(w)).length,
    count: 1,
  }));

  // calculate how many of each ticket we end up with
  for(let i = 0; i < ticketCounts.length; ++i) {
    for(let m = 1; m <= ticketCounts[i].matches; ++m) {
      // add a copy of the subsequent tickets for each copy of the current ticket
      ticketCounts[i + m].count += ticketCounts[i].count;
    }
  }

  return sum(ticketCounts.map(t => t.count));
}

function parseInput(input) {
  const CARD_REGEX = /^Card[ ]+(\d+):[ ]+([0-9\s]+)[ ]+\|[ ]+([0-9\s]+)$/;
  return input.trimEnd().split('\n').map(line => {
    const match = CARD_REGEX.exec(line);
    return {
      game: +match[1],
      winners: ints(match[2]),
      candidates: ints(match[3]),
    };
  });
}

export default { part1, part2 };
