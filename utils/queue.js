import { BinaryHeap } from '#utils/heap';

class PriorityQueue {
  constructor(priorityFn = PriorityQueue.defaultPriorityFn) {
    this._priorityFn = priorityFn;
    this._heap = new BinaryHeap((a, b) => this._priorityFn(a) - this._priorityFn(b));
  }

  enqueue(...items) {
    for(let item of items) {
      this._heap.insert(item);
    }
  }

  dequeue() {
    return this._heap.extract();
  }

  peek() {
    return this._heap.peek();
  }

  get length() {
    return this._heap.size;
  }

  includes(needle, matchFn = (a, b) => a === b) {
    return this._heap.has(needle, matchFn);
  }

  static defaultPriorityFn(el) {
    return el;
  }
}

export {
  PriorityQueue
};
