import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { counts } from '#utils/arr';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const hands = parseInput(input);

  const winnings = hands
    .sort((a, b) => cmpHands(a.hand, b.hand, rankHandPart1, CARD_RANKS_PART_1))
    .map(({ bid }, ix) => bid * (ix + 1));

  return sum(winnings);
}

async function* part2(input, options = {}) {
  const hands = parseInput(input);

  const winnings = hands
    .sort((a, b) => cmpHands(a.hand, b.hand, rankHandPart2, CARD_RANKS_PART_2))
    .map(({ bid }, ix) => bid * (ix + 1));

  return sum(winnings);
}

function parseInput(input) {
  return input.trimEnd().split('\n').map(line => {
    const [ hand, bid ] = line.split(' ');
    return {
      hand: hand.split(''),
      bid: +bid
    };
  });
}

const HAND_TYPES = {
  FIVE_OF_A_KIND: 6,
  FOUR_OF_A_KIND: 5,
  FULL_HOUSE: 4,
  THREE_OF_A_KIND: 3,
  TWO_PAIR: 2,
  ONE_PAIR: 1,
  HIGH_CARD: 0,
};
function rankHandPart1(hand) {
  const cardCounts = Object.values(counts(hand)).sort((a, b) => b - a);

  if(cardCounts[0] === 5) {
    return HAND_TYPES.FIVE_OF_A_KIND;
  } else if(cardCounts[0] === 4) {
    return HAND_TYPES.FOUR_OF_A_KIND;
  } else if(cardCounts[0] === 3 && cardCounts[1] === 2) {
    return HAND_TYPES.FULL_HOUSE;
  } else if(cardCounts[0] === 3) {
    return HAND_TYPES.THREE_OF_A_KIND;
  } else if(cardCounts[0] === 2 && cardCounts[1] === 2) {
    return HAND_TYPES.TWO_PAIR;
  } else if(cardCounts[0] === 2) {
    return HAND_TYPES.ONE_PAIR;
  } else if(cardCounts[0] === 1) {
    return HAND_TYPES.HIGH_CARD;
  } else {
    throw new Error(`Unrecognized hand counts: ${cardCounts.join('-')}`);
  }
}

function rankHandPart2(hand) {
  // count the cards without including jokers
  const cardCounts = Object.values(counts(hand.filter(card => card !== 'J'))).sort((a, b) => b - a);
  // jokers add to the cards we have the most of, to make the hand stronger
  // the || 0 is to catch the case where the hand is all jokers
  cardCounts[0] = (cardCounts[0] || 0) + hand.filter(card => card === 'J').length;

  if(cardCounts[0] === 5) {
    return HAND_TYPES.FIVE_OF_A_KIND;
  } else if(cardCounts[0] === 4) {
    return HAND_TYPES.FOUR_OF_A_KIND;
  } else if(cardCounts[0] === 3 && cardCounts[1] === 2) {
    return HAND_TYPES.FULL_HOUSE;
  } else if(cardCounts[0] === 3) {
    return HAND_TYPES.THREE_OF_A_KIND;
  } else if(cardCounts[0] === 2 && cardCounts[1] === 2) {
    return HAND_TYPES.TWO_PAIR;
  } else if(cardCounts[0] === 2) {
    return HAND_TYPES.ONE_PAIR;
  } else if(cardCounts[0] === 1) {
    return HAND_TYPES.HIGH_CARD;
  } else {
    throw new Error(`Unrecognized hand counts: ${cardCounts.join('-')}`);
  }
}

const CARD_RANKS_PART_1 = [ '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A' ];
const CARD_RANKS_PART_2 = [ 'J', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'Q', 'K', 'A' ];
function cmpHands(a, b, rankHandFn, cardRankArr) {
  const typeCmp = rankHandFn(a) - rankHandFn(b);
  if(typeCmp !== 0) {
    return typeCmp;
  }

  let cardCmp = 0;
  for(let i = 0; i < a.length; ++i) {
    cardCmp = cardRankArr.indexOf(a[i]) - cardRankArr.indexOf(b[i]);
    if(cardCmp !== 0) {
      break;
    }
  }
  return cardCmp;
}

export default { part1, part2 };
