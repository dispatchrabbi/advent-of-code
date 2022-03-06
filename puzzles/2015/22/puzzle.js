import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { PriorityQueue } from '#utils/queue';
import { deepEquals } from '#utils/obj';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { playerHP: 50, playerMana: 500 }) {
  const bossStats = parseInput(input);

  const initialGameState = new GameState(
    { hp: options.playerHP, mana: options.playerMana, armor: 0 },
    { hp: bossStats.hp, damage: bossStats.damage },
  );
  const cheapestWinGenerator = findCheapestPlayerWin(initialGameState, false);

  let result = cheapestWinGenerator.next();
  while(!result.done) {
    yield frame(`${result.value.chain.join(' -> ')}`, `Queue: ${result.value.queueSize} | Lowest cost: ${result.value.lowestCost}`);
    result = cheapestWinGenerator.next();
  }

  const { path, cost } = result.value;
  log.debug(GameState.formatLog(path));

  return cost;
}

async function* part2(input, options = { playerHP: 50, playerMana: 500 }) {
  const bossStats = parseInput(input);

  const initialGameState = new GameState(
    { hp: options.playerHP, mana: options.playerMana, armor: 0 },
    { hp: bossStats.hp, damage: bossStats.damage },
  );
  const cheapestWinGenerator = findCheapestPlayerWin(initialGameState, true);

  let result = cheapestWinGenerator.next();
  while(!result.done) {
    yield frame(`${result.value.chain.join(' -> ')}`, `Queue: ${result.value.queueSize} | Lowest cost: ${result.value.lowestCost}`);
    result = cheapestWinGenerator.next();
  }

  const { path, cost } = result.value;
  log.debug(GameState.formatLog(path));

  return cost;
}

function parseInput(input) {
  const [
    hitpointLine,
    damageLine,
  ] = input.trim().split('\n');

  const stats = {
    hp:     +hitpointLine.replace('Hit Points: ', ''),
    damage: +damageLine.replace('Damage: ', ''),
  };

  return stats;
}

const SPELLS = [
  { name: chalk.magenta('Magic Missile'), cost:  53, damage: 4 },
  { name: chalk.red('Drain'),         cost:  73, damage: 2, hp: 2 },
  { name: chalk.blue('Shield'),        cost: 113, effect: { turns: 6, armor:  7 } },
  { name: chalk.green('Poison'),        cost: 173, effect: { turns: 6, damage: 3 } },
  { name: chalk.yellow('Recharge'),      cost: 229, effect: { turns: 5, mana: 101 } },
];

class GameState {
  constructor(
    player = { hp: 0, mana: 0, armor: 0 },
    boss = { hp: 0, damage: 0 },
    effects = [],
    isPlayerTurn = false,
    manaSpent = 0
  ) {
    this.player = structuredClone(player);
    this.boss = structuredClone(boss);
    this.effects = structuredClone(effects);
    this.isPlayerTurn = isPlayerTurn;
    this.manaSpent = manaSpent;

    this.log = [];
    this.spellHistory = [];
  }

  getWinner() {
    if(this.player.hp <= 0) { return 'boss'; }
    if(this.boss.hp <= 0) { return 'player'; }
    return null;
  }

  clone(preserveLog = false) {
    const twin = new GameState(this.player, this.boss, this.effects, this.isPlayerTurn, this.manaSpent);
    if(preserveLog) {
      twin.log = this.log.slice();
    }
    twin.spellHistory = this.spellHistory.slice();

    return twin;
  }

  advance(hardMode = false) {
    // first, take precautions
    // if there's already a winner, this is a dead end
    if(this.getWinner()) { return []; }

    // set up the next turn
    const nextState = this.clone();
    nextState.isPlayerTurn = !this.isPlayerTurn;
    nextState.log.push(`-- ${nextState.isPlayerTurn ? 'Player' : 'Boss'}  Turn --`);
    nextState.log.push(`- Player has ${nextState.player.hp} HP, ${nextState.player.armor} AC, ${nextState.player.mana} MP`);
    nextState.log.push(`- Boss has ${nextState.boss.hp} HP`);

    // if it's hard mode and it's the player's turn, deal 1 damage to the player before anything else happens
    if(hardMode && nextState.isPlayerTurn) {
      nextState.player.hp -= 1;
      nextState.log.push(`Hard Mode deals 1 damage to the player; the player's HP is now ${nextState.player.hp}.`);

      if(nextState.getWinner()) {
        // the boss can't die from hard mode, so we know that if there's a winner, it's the boss
        nextState.log.push(`This kills the player, and the boss wins.`);
        // log.debug(chalk.red('death by hard mode'));
        return [ nextState ];
      }
    }

    // apply multi-turn effects
    for(let effect of nextState.effects) {
      effect.turns -= 1;
      if(effect.damage) {
        nextState.boss.hp -= effect.damage;
        nextState.log.push(`${effect.name} deals ${effect.damage} damage; its timer is now ${effect.turns}.`);
      }
      if(effect.mana) {
        nextState.player.mana += effect.mana;
        nextState.log.push(`${effect.name} provides ${effect.mana} mana; its timer is now ${effect.turns}.`);
      }
      if(effect.turns === 0) {
        if(effect.armor) {
          nextState.player.armor -= effect.armor;
        }
        nextState.log.push(`${effect.name} wears off` + (effect.armor ? `, decreasing armor by ${effect.armor}.` : '.'));
      }
    }

    // remove the effects that have worn off
    nextState.effects = nextState.effects.filter(effect => effect.turns > 0);

    // check if there's a winner (since the boss can be damaged here)
    if(nextState.getWinner()) {
      nextState.log.push(`This kills the boss, and the player wins.`);
      // log.debug(chalk.green('victory by effect'));
      return [ nextState ];
    }

    // and, lastly, either the player casts a spell or the boss does damage, depending on whose turn it is
    if(nextState.isPlayerTurn) {
      const availableSpells = SPELLS
        .filter(spell => spell.cost <= nextState.player.mana) // we need to be able to afford the spell
        .filter(spell => !nextState.effects.some(effect => effect.name === spell.name)) // it can't already be in effect
        .sort((a, b) => a.cost - b.cost);

      const forkedStates = availableSpells.map(spellCast => {
        const forkedState = nextState.clone(true);

        forkedState.player.mana -= spellCast.cost;
        forkedState.manaSpent += spellCast.cost;
        forkedState.spellHistory.push(spellCast.name);

        if(spellCast.effect) {
          forkedState.effects.push(Object.assign({ name: spellCast.name }, spellCast.effect));

          if(spellCast.effect.armor) {
            forkedState.player.armor += spellCast.effect.armor;
            forkedState.log.push(`Player casts ${spellCast.name}, increasing armor by ${spellCast.effect.armor}.`);
          } else {
            forkedState.log.push(`Player casts ${spellCast.name}.`);
          }
        } else if(spellCast.damage && spellCast.hp) {
          forkedState.boss.hp -= spellCast.damage;
          forkedState.player.hp += spellCast.hp;
          forkedState.log.push(`Player casts ${spellCast.name}, dealing ${spellCast.damage} damage, and healing ${spellCast.hp} HP.`);
        } else if(spellCast.damage) {
          forkedState.boss.hp -= spellCast.damage;
          forkedState.log.push(`Player casts ${spellCast.name}, dealing ${spellCast.damage} damage.`);
        }

        if(forkedState.getWinner()) {
          forkedState.log.push(`This kills the boss, and the player wins.`);
        }

        return forkedState;
      });

      return forkedStates;
    } else {
      // the boss swings his sword
      const damageDone = Math.max(nextState.boss.damage - nextState.player.armor, 1);
      nextState.player.hp -= damageDone;
      nextState.log.push(`Boss attacks for ${damageDone} damage!`);

      if(nextState.getWinner()) {
        nextState.log.push(`This kills the player, and the boss wins.`);
        // log.debug(chalk.red('death by boss'));
      }

      return [ nextState ];
    }
  }

  static isSameState(a, b) {
    return deepEquals(
      { player: a.player, boss: a.boss, effects: a.effects, isPlayerTurn: a.isPlayerTurn },
      { player: b.player, boss: b.boss, effects: b.effects, isPlayerTurn: b.isPlayerTurn }
    );
  }

  static formatLog(stateHistory) {
    return stateHistory.filter(state => state.log.length > 0).map(state => state.log.join('\n')).join('\n\n');
  }
}

function* findCheapestPlayerWin(initialGameState, hardMode = false) {
  // we'll use this to be able to find our path back
  const cameFrom = new Map();
  function reconstructPath(cameFrom, current) {
    const path = [ current ];
    while(cameFrom.has(current)) {
      current = cameFrom.get(current);
      path.unshift(current);
    }
    return path;
  }

  const queue = new PriorityQueue(state => state.manaSpent);
  queue.enqueue(initialGameState);

  while(queue.length > 0) {
    // pick off the lowest mana spent so far
    const current = queue.dequeue();
    // yield { queueSize: queue.length, lowestCost: current.manaSpent, chain: current.spellHistory };

    // do we have a winner?
    const winner = current.getWinner();
    if(winner === 'player') {
      // we did it!
      return { path: reconstructPath(cameFrom, current), cost: current.manaSpent };
    } else if(winner === 'boss') {
      log.info('removing from queue');
      // no point in continuing down this path
      continue;
    }

    // advance the state of the game
    const nextStates = current.advance(hardMode)
      .filter(state => state.getWinner() !== 'boss')
      .filter(state => !queue.includes(state, GameState.isSameState));
    nextStates.forEach(next => cameFrom.set(next, current));
    queue.enqueue(...nextStates);
  }

  // if we get here, there's no player win
  throw new Error(`Could not find a player win at all!`);
}

export default { part1, part2 };
