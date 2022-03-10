import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { cmp } from '#utils/arr';
import { sum } from '#utils/maths';
import { rot } from '#utils/text';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const rooms = parseInput(input);
  const realRooms = rooms.filter(verifyRoom);

  return sum(realRooms.map(room => room.sectorId));
}

async function* part2(input, options = {}) {
  const rooms = parseInput(input);
  const searchRooms = rooms.filter(verifyRoom).map(room => {
    room.name = rot(room.encryptedName, room.sectorId).replaceAll('-', ' ');
    return room;
  }).filter(room => !hasEasterWord(room.name));

  return searchRooms[0].sectorId;
}

function parseInput(input) {
  const ROOM_REGEX = /^([-a-z]+)-(\d+)\[([a-z]{5})\]$/;
  const rooms = input.trim().split('\n').map(code => {
    const matches = code.match(ROOM_REGEX);
    return {
      encryptedName: matches[1],
      sectorId: +matches[2],
      checksum: matches[3],
    };
  });

  return rooms;
}

function verifyRoom(room) {
  const letterCounts = countChars(room.encryptedName.replaceAll('-', ''));
  const topFiveLetters = Object.entries(letterCounts)
    .sort((a, b) => b[1] === a[1] ? cmp(a[0], b[0]) : b[1] - a[1]) // sort by count desc; if count is the same, sort alphabetically asc
    .slice(0, 5).map(entry => entry[0]).join('');

  return topFiveLetters === room.checksum;
}

function countChars(str) {
  return str.split('').reduce((counter, char) => {
    counter[char] = (counter[char] || 0) + 1;
    return counter;
  }, {});
}

const EASTER_WORDS = /bunny|chocolate|dye|flower|basket|egg|candy|grass|rabbit|jellybean|scavenger hunt/;
function hasEasterWord(roomName) {
  return EASTER_WORDS.test(roomName);
}

export default { part1, part2 };
