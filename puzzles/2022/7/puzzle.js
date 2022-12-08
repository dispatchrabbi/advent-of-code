import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Tree, TreeNode } from '#utils/tree';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const commands = parseInput(input);
  const filesystem = reconstructFilesystemFromConsoleLogs(commands);

  const smallDirTotal = sum(filesystem.search(node => node._data.type === 'dir').map(findSizeOfSubtree).filter(size => size <= 100000));

  return smallDirTotal;
}

async function* part2(input, options = {}) {
  const commands = parseInput(input);
  const filesystem = reconstructFilesystemFromConsoleLogs(commands);

  const TOTAL_DISK_SPACE = 70000000;
  const TARGET_FREE_SPACE = 30000000;

  const spaceNeeded = TARGET_FREE_SPACE - (TOTAL_DISK_SPACE - findSizeOfSubtree(filesystem._root));
  const smallestCandidateDirectorySize = filesystem
    .search(node => node._data.type === 'dir' && findSizeOfSubtree(node) >= spaceNeeded)
    .reduce((min, dir) => findSizeOfSubtree(dir) < min ? findSizeOfSubtree(dir) : min, Infinity);

  return smallestCandidateDirectorySize;
}

function parseInput(input) {
  const logLines = input.trim().split('\n');
  const commands = [];

  for(let i = 0; i < logLines.length; ++i) {
    if(logLines[i].startsWith('$')) {
      const [ cmd, arg ] = logLines[i].slice(2).split(' ');
      switch(cmd) {
        case 'cd':
          commands.push({ cmd, dir: arg });
          break;
        case 'ls':
          commands.push({ cmd, output: [] });
          break;
        default:
          throw new Error(`Unrecognized command on line ${i + 1}: ${logLines[i]}`);
          break;
      }
    } else {
      commands[commands.length - 1].output.push(logLines[i]);
    }
  }

  return commands;
}

function reconstructFilesystemFromConsoleLogs(commands) {
  const filesystem = new Tree(new TreeNode({
    name: '/',
    type: 'dir',
    size: 0,
  }));

  let cwd = filesystem._root;

  for(let command of commands) {
    // log.debug(`${cwd._data.name} $`, command);
    if(command.cmd === 'cd') {
      if(command.dir === '/') {
        cwd = filesystem._root;
      } else if(command.dir === '..') {
        cwd = cwd._parent;
      } else {
        let nextDir = cwd.findChild(child => child._data.name === command.dir);
        if(!nextDir) {
          nextDir = new TreeNode({ name: command.dir, type: 'dir', size: 0 });
          cwd.addChild(nextDir);
        }
        cwd = nextDir;
      }
      // log.debug(`cd`, cwd);
    } else if(command.cmd === 'ls') {
      for(let line of command.output) {
        const [ info, name ] = line.split(' ');
        if(!cwd.hasChild(c => c._data.name === name)) {
          cwd.addChild(new TreeNode({
            name,
            type: info === 'dir' ? 'dir' : 'file',
            size: info === 'dir' ? 0 : +info,
          }));
        }
      }
      // log.debug(`ls`, cwd);
    }
  }

  // log.debug('\n', formatTree(filesystem._root));
  return filesystem;
}

const memo = new Map();
function findSizeOfSubtree(node) {
  if(memo.has(node)) { return memo.get(node); }

  const totalSize = node._data.size + sum(node._children.map(findSizeOfSubtree));
  memo.set(node, totalSize);

  return totalSize;
}

function formatTree(rootNode, indent = 0) {
  const formatted = ' '.repeat(indent) + `- ${rootNode._data.name} (${rootNode._data.type}${rootNode._data.type === 'file' ? ', size=' + rootNode._data.size : ''})`;
  return [ formatted ].concat(rootNode.children.sort(child => child._data.name).map(child => formatTree(child, indent + 2))).join('\n');
}

export default { part1, part2 };
