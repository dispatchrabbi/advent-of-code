class TreeNode {
  constructor(data = {}, parent = null) {
    this._data = data;
    this._parent = parent;

    this._children = [];
  }

  get data() { return this._data; }
  get parent() { return this._parent; }
  get children() { return this._children; }

  addChild(childNode) {
    this._children.push(childNode);
    childNode._parent = this;
  }

  findChild(predicate) {
    return this._children.find(predicate);
  }

  hasChild(predicate) {
    return this.findChild(predicate) !== undefined;
  }

  pathFromRoot() {
    const path = [];

    let currentNode = this;
    while(currentNode) {
      path.unshift(currentNode);
      currentNode = currentNode.parent;
    }

    return path;
  }
}

class Tree {
  constructor(root) {
    this._root = root;
  }

  get root() { return this._root; }

  iterate(fn = (node) => { }, depthFirst = true) {
    const nodes = [ this.root ];
    while(nodes.length > 0) {
      const currentNode = nodes.shift();

      const ret = fn(currentNode);
      if(ret === false) {
        break;
      }

      if(depthFirst) {
        nodes.unshift(...currentNode.children);
      } else {
        nodes.push(...currentNode.children);
      }
    }
  }

  search(searchFn = node => false, limit = Infinity, depthFirst = true) {
    const hits = [];

    this.iterate(function(node) {
      if(searchFn(node)) {
        hits.push(node);
      }

      if(hits.length >= limit) {
        return false; // cut off early
      }
    }, depthFirst);

    return hits;
  }
}

export {
  TreeNode,
  Tree
};
