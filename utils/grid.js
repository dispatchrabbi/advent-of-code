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

export {
  coords2str, str2coords, arr2coords, coords2arr,
  adjacent, isAdjacent,
  orthogonal, orthogonal3d,
  manhattan,
};
