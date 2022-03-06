// well folks, it's come to this
class BinaryHeap {
  constructor(compareFn = BinaryHeap.defaultCompareFn) {
    this._arr = []; // we will implement the heap using an array to hold the nodes
    this._compareFn = compareFn;
  }

  insert(el) {
    // add the element to the bottom level of the heap, leftmost space (which corresponds to the next index in the array)
    let insertedIx = this._arr.length;
    this._arr.push(el);

    // then sift-up to revalidate the heap
    this._siftUp(insertedIx);
  }

  peek() {
    return this._arr[0];
  }

  extract() {
    if(this._arr.length <= 0) {
      return null;
    }

    // pull out the top of the heap...
    const top = this._arr.shift();
    if(this._arr.length >= 1) {
      // replace it with whatever element is at the end of the array
      this._arr.unshift(this._arr.pop());
      // then sift-down to revalidate the heap
      this._siftDown(0);
    }

    // return the top
    return top;
  }

  has(needle, matchFn = (a, b) => a === b) {
    return this._arr.findIndex(el => matchFn(el, needle)) > -1;
  }

  get size() {
    return this._arr.length;
  }

  _siftUp(startIx) {
    if(startIx <= 0) { return; }
    // check if the given element should be before its parent
    const parentIx = BinaryHeap._parent(startIx);
    if(this._compareByIndex(parentIx, startIx) > 0) {
      // if so, swap it and then sift-up from the new spot
      this._swap(parentIx, startIx);
      this._siftUp(parentIx);
    }
  }

  _siftDown(startIx) {
    // find the before-est of the parent and the two children
    const childIxs = BinaryHeap._children(startIx).filter(ix => ix < this._arr.length);
    const swapIx = childIxs.reduce((winningIx, childIx) => this._compareByIndex(winningIx, childIx) > 0 ? childIx : winningIx, startIx);

    // if the before-est is one of the children, swap and then sift-down from the new spot
    if(startIx !== swapIx) {
      this._swap(startIx, swapIx);
      this._siftDown(swapIx);
    }
  }

  _compareByIndex(aIx, bIx) {
    return this._compareFn(this._arr[aIx], this._arr[bIx]);
  }

  _swap(ix1, ix2) {
    const tmp = this._arr[ix1];
    this._arr[ix1] = this._arr[ix2];
    this._arr[ix2] = tmp;
  }

  format(nodeFormatFn = BinaryHeap.defaultNodeFormatFn, ix = 0) {
    if(ix >= this._arr.length) { return ''; }
    const childValues = BinaryHeap._children(ix).filter(cix => cix < this._arr.length).map(cix => this.format(nodeFormatFn, cix));
    const formattedChildren = childValues.some(v => v.length) ? ` [ ${childValues.join(' ')} ]` : '';
    return `${nodeFormatFn(this._arr[ix])}${formattedChildren}`;
  }

  static _parent(ix) { return Math.floor((ix - 1) / 2); }
  static _leftChild(ix) { return 2 * ix + 1; }
  static _rightChild(ix) { return 2 * ix + 2; }
  static _children(ix) { return [ BinaryHeap._leftChild(ix), BinaryHeap._rightChild(ix) ]; }

  static defaultCompareFn(a, b) {
    return a - b;
  }

  static defaultNodeFormatFn(node) {
    return node.toString();
  }
}

export {
  BinaryHeap
};
