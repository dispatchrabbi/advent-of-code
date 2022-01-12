function coords2str({x, y}) {
  return `${x},${y}`;
}

function str2coords(str) {
  const coords = str.split(',');
  return {
    x: coords[0],
    y: coords[1],
  };
}

export {
  coords2str,
  str2coords
};
