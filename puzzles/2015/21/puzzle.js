import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const bossStats = parseInput(input);

  const outfit = optimizeStrategyForProfit(bossStats);

  return outfit.cost;
}

async function* part2(input, options = {}) {
  const bossStats = parseInput(input);

  const outfit = optimizeStrategyForEvil(bossStats);
  log.info(outfit);

  return outfit.cost;
}

function parseInput(input) {
  const [
    hitpointLine,
    damageLine,
    armorLine
  ] = input.trim().split('\n');

  const stats = {
    hitpoints: +hitpointLine.replace('Hit Points: ', ''),
    damage:    +damageLine.replace('Damage: ', ''),
    armor:     +armorLine.replace('Armor: ', ''),
  };

  return stats;
}

const WEAPONS = [
  { name: "Dagger",     cost:  8, damage: 4, armor: 0 },
  { name: "Shortsword", cost: 10, damage: 5, armor: 0 },
  { name: "Warhammer",  cost: 25, damage: 6, armor: 0 },
  { name: "Longsword",  cost: 40, damage: 7, armor: 0 },
  { name: "Greataxe",   cost: 74, damage: 8, armor: 0 },
];

const ARMOR = [
  { name: "Leather",    cost:  13, damage: 0, armor: 1 },
  { name: "Chainmail",  cost:  31, damage: 0, armor: 2 },
  { name: "Splintmail", cost:  53, damage: 0, armor: 3 },
  { name: "Bandedmail", cost:  75, damage: 0, armor: 4 },
  { name: "Platemail",  cost: 102, damage: 0, armor: 5 },
];

const RINGS = [
  { name: "Damage +1",  cost:  25, damage: 1, armor: 0 },
  { name: "Damage +2",  cost:  50, damage: 2, armor: 0 },
  { name: "Damage +3",  cost: 100, damage: 3, armor: 0 },
  { name: "Defense +1", cost:  20, damage: 0, armor: 1 },
  { name: "Defense +2", cost:  40, damage: 0, armor: 2 },
  { name: "Defense +3", cost:  80, damage: 0, armor: 3 },
];

const NOTHING = { name: "Nothing", cost: 0, damage: 0, armor: 0};

function listAllOutfits() {
  // ah, my favorite advent of code stategy, brute force
  const outfits = [];

  for(let weapon of WEAPONS) { // you must buy a weapon
    for(let armor of ARMOR.concat([NOTHING])) {
      for(let ring1 of RINGS.concat([NOTHING])) {
        for(let ring2 of RINGS.concat([NOTHING]).filter(r => r.name !== ring1.name)) {
          outfits.push({
            cost: weapon.cost + armor.cost + ring1.cost + ring2.cost,
            damage: weapon.damage + armor.damage + ring1.damage + ring2.damage,
            armor: weapon.armor + armor.armor + ring1.armor + ring2.armor,
            items: [ weapon, armor, ring1, ring2 ],
          });
        }
      }
    }
  }

  return outfits;
}

function optimizeStrategyForProfit(bossStats) {
  let outfit;
  for(outfit of listAllOutfits().sort((a, b) => a.cost - b.cost)) {
    const player = {
      hitpoints: 100,
      damage:      0 + outfit.damage,
      armor:       0 + outfit.armor,
    };

    const boss = Object.assign({}, bossStats);

    const didPlayerWin = simulateBattle(player, boss);
    if(didPlayerWin) {
      break;
    }
  }

  return outfit;
}

function optimizeStrategyForEvil(bossStats) {
  let outfit;
  for(outfit of listAllOutfits().sort((a, b) => b.cost - a.cost)) {
    const player = {
      hitpoints: 100,
      damage:      0 + outfit.damage,
      armor:       0 + outfit.armor,
    };

    const boss = Object.assign({}, bossStats);

    const didPlayerWin = simulateBattle(player, boss);
    log.info(`Simulating with 🗡 ${player.damage} 🛡 ${player.armor} ($${outfit.cost}): ${didPlayerWin ? 'WIN' : 'LOSS'}`);
    if(!didPlayerWin) {
      break;
    }
  }

  return outfit;
}

// there's a mathematical way to do this without actually simulating it...
// ...but what fun is that?
function simulateBattle(player, boss) {
  while(true) {
    // player's turn
    boss.hitpoints -= calculateDamage(player, boss);
    if(boss.hitpoints <= 0) { return true; }

    // boss's turn
    player.hitpoints -= calculateDamage(boss, player);
    if(player.hitpoints <= 0) { return false; }
  }
}

function calculateDamage(attacker, defender) {
  return Math.max(1, attacker.damage - defender.armor);
}

export default { part1, part2 };
