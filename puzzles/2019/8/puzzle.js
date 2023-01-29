import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { width: 25, height: 6 }) {
  const pixels = parseInput(input);
  const layers = pixels2layers(pixels, options);

  const layerWithFewest0s = layers.reduce((winner, layer) => (!winner || (countPixelsByColor(layer, 0) < countPixelsByColor(winner, 0))) ? layer : winner, null);

  const onesPresent = countPixelsByColor(layerWithFewest0s, 1);
  const twosPresent = countPixelsByColor(layerWithFewest0s, 2);

  return onesPresent * twosPresent;
}

async function* part2(input, options = { width: 25, height: 6 }) {
  const pixels = parseInput(input);
  const layers = pixels2layers(pixels, options);

  const merged = layers.reduce(mergeLayers, null);
  log.info('\n' + renderImage(merged, options));

  return merged.join('');
}

function parseInput(input) {
  return input.trimEnd().split('').map(x => +x);
}

function pixels2layers(pixels, { width, height }) {
  const layers = [];

  let layerStart = 0;
  const layerSize = width * height;
  while(layerStart < pixels.length) {
    layers.push(pixels.slice(layerStart, layerStart + layerSize));
    layerStart += layerSize;
  }

  return layers;
}

function countPixelsByColor(pixels, color) {
  return pixels.filter(pixel => pixel === color).length;
}

const COLORS = {
  BLACK: 0,
  WHITE: 1,
  TRANSPARENT: 2,
};
function mergeLayers(above, below) {
  if(!above) { return below; }
  if(!below) { return above; }

  return above.map((el, ix) => el === COLORS.TRANSPARENT ? below[ix] : above[ix]);
}

function renderImage(pixels, { width, height }) {
  pixels = pixels.map(pixel => {
    switch(pixel) {
      case COLORS.BLACK:
        return '█';
      case COLORS.WHITE:
        return ' ';
      case COLORS.TRANSPARENT:
        return '░';
      default:
        return '?';
    }
  });

  const rows = [];

  let offset = 0;
  while(offset < pixels.length) {
    rows.push(pixels.slice(offset, offset + width));
    offset += width;
  }

  return rows.map(row => row.join('')).join('\n') + '\n';
}

export default { part1, part2 };
