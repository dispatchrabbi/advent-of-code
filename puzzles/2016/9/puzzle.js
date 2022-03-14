import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const compressed = parseInput(input);
  const decompressed = decompress(compressed);

  return decompressed.length;
}

async function* part2(input, options = {}) {
  const compressed = parseInput(input);
  const decompressedLength = decompressV2Length(compressed);

  return decompressedLength;
}

function parseInput(input) {
  return input.trim();
}

function decompress(str) {
  let out = '';

  let cursor = 0;
  while(cursor < str.length) {
    // find the next marker
    const nextMarkerIndex = str.indexOf('(', cursor);
    if(nextMarkerIndex < 0) {
       // no more markers, so...
      //  log.debug(`Finishing with ${str.substr(cursor)}`);
      out += str.substr(cursor); // add the rest of the string
      break; // get outta here
    }

    // log.debug(`Adding ${str.substring(cursor, nextMarkerIndex)}`);
    out += str.substring(cursor, nextMarkerIndex); // add anything from the cursor up to the marker (non-repeated text)

    // parse the marker and get the repeated string
    const nextMarkerEndIndex = str.indexOf(')', nextMarkerIndex);
    const [ repeatLen, repeatTimes ] = str.substring(nextMarkerIndex + 1, nextMarkerEndIndex).split('x').map(x => +x);
    const repeatStr = str.substr(nextMarkerEndIndex + 1, repeatLen);

    // log.debug(`Adding ${repeatStr} x${repeatTimes}`);
    out += Array(repeatTimes).fill(repeatStr).join(''); // repeat the string indicated by the marker

    // move the cursor to after the repeated text
    cursor = nextMarkerEndIndex + 1 + repeatLen;
  }

  return out;
}

function decompressV2Length(str) {
  let outLen = 0;
  // log.debug({initial: outLen});

  let cursor = 0;
  while(cursor < str.length) {
    // find the next marker
    const nextMarkerIndex = str.indexOf('(', cursor);
    if(nextMarkerIndex < 0) {
       // no more markers, so...
      outLen += (str.length - cursor) // add the rest of the string
      // log.debug({noMoreMarkers: outLen});
      break; // get outta here
    }

    // add anything from the cursor up to the marker (non-repeated text)
    outLen += (nextMarkerIndex - cursor);
    // log.debug({premarker: outLen});

    // parse the marker and get the repeated string
    const nextMarkerEndIndex = str.indexOf(')', nextMarkerIndex);
    const [ repeatLen, repeatTimes ] = str.substring(nextMarkerIndex + 1, nextMarkerEndIndex).split('x').map(x => +x);
    const repeatStr = str.substr(nextMarkerEndIndex + 1, repeatLen);
    // log.debug({repeatLen, repeatTimes, repeatStr});

    // add the decompressed length of the repeated string the indicated number of times
    outLen += (decompressV2Length(repeatStr) * repeatTimes);
    // log.debug({withDecomp: outLen});

    // move the cursor to after the repeated text
    cursor = nextMarkerEndIndex + 1 + repeatLen;
  }

  return outLen;
}

export default { part1, part2 };
