import { deepEquals } from '#utils/obj';

class GraphNode {
  constructor(data = {}) {
    this._data = data;
    this._edges = [];
  }

  get data() { return this._data; }
  get edges() { return this._edges; }

  addEdge(neighbor, cost, metadata) {
    this.edges.push({ neighbor, cost, metadata });
  }

  matchesData(data) {
    return deepEquals(data, this.data);
  }
}

class Graph {
  constructor(root) {
    this._root = root;

    this._nodes = new Set([root]);
  }

  get root() { return this._root; }
  get nodes() { return this._nodes; }

  addNode(node) {
    this._nodes.add(node);
  }

  aStar(isGoalFn, heuristicFn, startNode = this.root) {
    function reconstructPath(cameFrom, current) {
      const path = [ current ];
      while(cameFrom.has(current)) {
        current = cameFrom.get(current);
        path.unshift(current);
      }
      return path;
    }

    // the set of nodes that have been discovered but still need to be investigated
    const openSet = new Set();
    openSet.add(startNode);

    // for any node n, cameFrom.get(n) will give you the preceding node on the cheapest known path to n
    const cameFrom = new Map();

    // for any node n, g(n) is the lowest known cost to get to n
    const gScore = new MapWithDefaultValue(Infinity);
    gScore.set(startNode, 0);

    // for any node n, f(n) is our best guess of the shortest path from start to end through n
    // f(n) = g(n) + heuristicFn(n)
    const fScore = new MapWithDefaultValue(Infinity);
    fScore.set(startNode, heuristicFn(startNode));

    while(openSet.size > 0) {
      // get the node in the open set with the lowest f score
      const currentNode = [...openSet].reduce((winner, node) => fScore.get(node) < fScore.get(winner) ? node : winner, null);
      // is this the goal? woo!
      if(isGoalFn(currentNode)) {
        return { path: reconstructPath(cameFrom, currentNode), cost: gScore.get(currentNode) };
      }

      openSet.delete(currentNode);
      for(let { neighbor, cost } of currentNode.edges) {
        const tentativeGScore = gScore.get(currentNode) + cost;
        if(tentativeGScore < gScore.get(neighbor)) {
          // this is a better path to that neighbor - overwrite what we know about the neighbor
          cameFrom.set(neighbor, currentNode);
          gScore.set(neighbor, tentativeGScore);
          fScore.set(neighbor, tentativeGScore + heuristicFn(neighbor));
          openSet.add(neighbor);
        }
      }
    }

    // if we get here, we failed to find a path
    return false;
  }

  dijkstra(isGoalFn, startNode = this.root) {
    return this.aStar(isGoalFn, () => 0, startNode);
  }
}

class MapWithDefaultValue {
  constructor(defaultValue) {
    this._map = new Map();
    this._defaultValue = defaultValue;
  }

  get(key) {
    const val = this._map.get(key);
    return val === undefined ? this._defaultValue : val;
  }

  set(key, value) {
    this._map.set(key, value);
    return this;
  }

  size() {
    return this._map.size;
  }
}

export {
  GraphNode,
  Graph
};
