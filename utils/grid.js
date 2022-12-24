function coords2str({x, y}) {
  return `${x},${y}`;
}

function str2coords(str) {
  const coords = str.split(',');
  return {
    x: +coords[0],
    y: +coords[1],
  };
}

function arr2coords([x, y]) {
  return { x, y };
}

function coords2arr({x, y}) {
  return [ x, y ];
}

function areCoordsEqual({x: x1, y: y1}, {x: x2, y: y2}) {
  return x1 === x2 && y1 === y2;
}

function adjacent({x, y}) {
  return [
    { x: x-1, y: y+1 }, { x: x  , y: y+1 }, { x: x+1, y: y+1 },
    { x: x-1, y: y   },                     { x: x+1, y: y   },
    { x: x-1, y: y-1 }, { x: x  , y: y-1 }, { x: x+1, y: y-1 },
  ];
}

function isAdjacent({x: x1, y: y1}, {x: x2, y: y2}) {
  return (Math.abs(x1 - x2) <= 1) && (Math.abs(y1 - y2) <= 1);
}

function orthogonal({x, y}) {
  return [
                        { x: x  , y: y+1 },
    { x: x-1, y: y   },                     { x: x+1, y: y   },
                        { x: x  , y: y-1 },
  ];
}

function orthogonal3d({x, y, z}) {
  return [
    { x: x-1, y: y  , z: z   }, { x: x+1, y: y  , z: z   },
    { x: x  , y: y-1, z: z   }, { x: x  , y: y+1, z: z   },
    { x: x  , y: y  , z: z-1 }, { x: x  , y: y  , z: z+1 },
  ];
}

function manhattan({x: x1, y: y1}, {x: x2, y: y2}) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

class GridMap {
  constructor() {
    this._arr = [];
  }

  set({x, y}, val) {
    if(!this._arr[y]) {
      this._arr[y] = [];
    }

    this._arr[y][x] = val;

    return this;
  }

  get({x, y}) {
    return this._arr[y] && this._arr[y][x];
  }

  has({x, y}) {
    return !!this.get({x, y});
  }

  increment({x, y}) {
    if(!this.has({x, y})) {
      this.set({x, y}, 0);
    }

    this._arr[y][x]++;
    return this;
  }

  keys() {
    return this._arr.flatMap((subarr, y) => subarr.map((_, x) => ({ x, y })));
  }

  values() {
    return this._arr.flatMap(el => el);
  }

  entries() {
    return this._arr.flatMap((subarr, y) => subarr.map((val, x) => ([ { x, y }, val ])));
  }
}

export {
  coords2str, str2coords, arr2coords, coords2arr,
  areCoordsEqual,
  adjacent, isAdjacent,
  orthogonal, orthogonal3d,
  manhattan,
  GridMap,
};
