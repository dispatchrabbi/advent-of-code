import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { sumReducer, productReducer } from '#utils/maths';

async function part1(input, options = {}) {
  const ingredients = parseInput(input);

  const recipes = enumerateCookieRecipes(ingredients, 100);
  const highScore = recipes
    .map(recipe => addProperties(...recipe))
    .reduce((winner, recipe) => Math.max(winner, scoreRecipe(recipe)), -Infinity);

  return highScore;
}

async function part2(input, options = {}) {
  const ingredients = parseInput(input);

  const recipes = enumerateCookieRecipes(ingredients, 100);
  const highScore = recipes
    .map(recipe => addProperties(...recipe))
    .filter(recipe => recipe.calories === 500)
    .reduce((winner, recipe) => Math.max(winner, scoreRecipe(recipe)), -Infinity);

  return highScore;
}

const INGREDIENT_REGEX = /^(\w+): capacity (-?\d+), durability (-?\d+), flavor (-?\d+), texture (-?\d+), calories (-?\d+)$/;
function parseInput(input) {
  return input.trim().split('\n').map(line => {
    const [ _, name, capacity, durability, flavor, texture, calories ] = INGREDIENT_REGEX.exec(line);
    return { name, capacity: +capacity, durability: +durability, flavor: +flavor, texture: +texture, calories: +calories };
  });
}

// not afraid of a little brute force action!
// there is absolutely some optimization to be had here, but I'm not gonna do it
function enumerateCookieRecipes(ingredients, maxTsps) {
  if(ingredients.length === 1) {
    return [ [ calculateProperties(ingredients[0], maxTsps) ] ];
  }

  const recipes = [];

  for(let tsps = 0; tsps <= maxTsps; ++tsps) {
    const tspsLeft = maxTsps - tsps;
    const properties = calculateProperties(ingredients[0], tsps);
    const restOfTheRecipe = enumerateCookieRecipes(ingredients.slice(1), tspsLeft);
    recipes.push(...(restOfTheRecipe.map(rest => [properties, ...rest])));
  }

  return recipes;
}

function calculateProperties(ingredient, tsps) {
  return {
    capacity: ingredient.capacity * tsps,
    durability: ingredient.durability * tsps,
    flavor: ingredient.flavor * tsps,
    texture: ingredient.texture * tsps,
    calories: ingredient.calories * tsps,
  };
}

function scoreRecipe(recipeTotals) {
  const score = ['capacity', 'durability', 'flavor', 'texture'].map(key => Math.max(0, recipeTotals[key])).reduce(productReducer, 1);
  return score;
}

function addProperties(...properties) {
  return {
    capacity: properties.map(p => p.capacity).reduce(sumReducer, 0),
    durability: properties.map(p => p.durability).reduce(sumReducer, 0),
    flavor: properties.map(p => p.flavor).reduce(sumReducer, 0),
    texture: properties.map(p => p.texture).reduce(sumReducer, 0),
    calories: properties.map(p => p.calories).reduce(sumReducer, 0),
  };
}



export default { part1, part2 };
