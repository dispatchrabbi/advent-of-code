export type Graph<NodeData, EdgeData> = {
  nodes: GraphNode<NodeData>[];
  edges: GraphEdge<EdgeData, NodeData>[];
}

export type GraphNode<NodeData> = {
  data: NodeData;
}

export type GraphEdge<EdgeData, NodeData> = {
  nodes: Set<GraphNode<NodeData>>;
  data: EdgeData;
  distance: number;
}

export function createEmptyGraph<N, E>(): Graph<N, E> {
  return {
    nodes: [],
    edges: [],
  };
}

export function addNode<N, E>(graph: Graph<N, E>, nodeData: N): GraphNode<N> {
  const node = {
    data: nodeData,
  };

  graph.nodes.push(node);
  return node;
}

export function addEdge<N, E>(graph: Graph<N, E>, nodes: Iterable<GraphNode<N>>, distance: number, edgeData: E): GraphEdge<E, N> {
  const edge = {
    nodes: new Set(nodes),
    data: edgeData,
    distance,
  };

  graph.edges.push(edge);
  return edge;
}