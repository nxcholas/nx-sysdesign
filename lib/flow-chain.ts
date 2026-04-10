import type { Connection, PlacedComponent } from './types';
import { getComponentRole, getSmartRoutePoints } from './connection-utils';

/** Consistent animation speed in screen-space pixels per second. */
export const FLOW_SPEED = 150;

export interface FlowChainSegment {
  connection: Connection;
  source: PlacedComponent;
  target: PlacedComponent;
}

export interface FlowChain {
  id: string;
  segments: FlowChainSegment[];
}

type ScreenMapper = (pt: { x: number; y: number }) => { x: number; y: number };

/**
 * Builds directed flow chains from the connection graph.
 *
 * Each chain is a linear sequence of connections starting from a root node
 * (entity with in-degree 0). Branches produce separate chains, each getting
 * its own animated bubble.
 */
export function buildFlowChains(
  connections: Connection[],
  components: PlacedComponent[],
): FlowChain[] {
  if (connections.length === 0) return [];

  const componentMap = new Map(components.map(c => [c.id, c]));

  // Build directed adjacency: componentId -> outgoing connections
  const outgoing = new Map<string, Connection[]>();
  for (const conn of connections) {
    const list = outgoing.get(conn.sourceId) || [];
    list.push(conn);
    outgoing.set(conn.sourceId, list);
  }

  // Find connected components (undirected BFS)
  const adjacency = new Map<string, Set<string>>();
  for (const conn of connections) {
    if (!adjacency.has(conn.sourceId)) adjacency.set(conn.sourceId, new Set());
    if (!adjacency.has(conn.targetId)) adjacency.set(conn.targetId, new Set());
    adjacency.get(conn.sourceId)!.add(conn.targetId);
    adjacency.get(conn.targetId)!.add(conn.sourceId);
  }

  const visited = new Set<string>();
  const groups: string[][] = [];

  for (const nodeId of adjacency.keys()) {
    if (visited.has(nodeId)) continue;
    const group: string[] = [];
    const queue = [nodeId];
    visited.add(nodeId);
    while (queue.length > 0) {
      const current = queue.shift()!;
      group.push(current);
      for (const neighbor of adjacency.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    groups.push(group);
  }

  // For each connected component, find root and trace paths
  const chains: FlowChain[] = [];

  for (const group of groups) {
    const groupSet = new Set(group);
    const groupConnections = connections.filter(
      c => groupSet.has(c.sourceId) && groupSet.has(c.targetId)
    );

    const root = findRoot(group, groupConnections, componentMap);
    if (!root) continue;

    // DFS from root following directed edges
    tracePaths(root, outgoing, componentMap, chains);
  }

  return chains;
}

/**
 * Finds the root node of a connected component.
 * Prefers an entity with in-degree 0 (no incoming connections).
 */
function findRoot(
  group: string[],
  groupConnections: Connection[],
  componentMap: Map<string, PlacedComponent>,
): string | null {
  // Compute in-degree within this group
  const inDegree = new Map<string, number>();
  for (const id of group) inDegree.set(id, 0);
  for (const conn of groupConnections) {
    inDegree.set(conn.targetId, (inDegree.get(conn.targetId) || 0) + 1);
  }

  // Prefer entity with in-degree 0
  for (const id of group) {
    const comp = componentMap.get(id);
    if (comp && getComponentRole(comp.kind) === 'entity' && inDegree.get(id) === 0) {
      return id;
    }
  }

  // Fallback: any node with in-degree 0
  for (const id of group) {
    if (inDegree.get(id) === 0) return id;
  }

  // Fallback: first entity in any connection
  for (const conn of groupConnections) {
    const source = componentMap.get(conn.sourceId);
    if (source && getComponentRole(source.kind) === 'entity') return conn.sourceId;
  }

  // Last resort
  return group[0] ?? null;
}

/**
 * DFS from a root node, following outgoing connections.
 * Branches produce separate chains. Cycles are detected and terminated.
 */
function tracePaths(
  startId: string,
  outgoing: Map<string, Connection[]>,
  componentMap: Map<string, PlacedComponent>,
  chains: FlowChain[],
) {
  function dfs(nodeId: string, path: FlowChainSegment[], visitedNodes: Set<string>) {
    const nodeOutgoing = outgoing.get(nodeId) || [];

    if (nodeOutgoing.length === 0) {
      // Dead end — emit path
      if (path.length > 0) {
        chains.push({ id: path.map(s => s.connection.id).join('-'), segments: [...path] });
      }
      return;
    }

    for (const conn of nodeOutgoing) {
      const source = componentMap.get(conn.sourceId);
      const target = componentMap.get(conn.targetId);
      if (!source || !target) continue;

      const segment: FlowChainSegment = { connection: conn, source, target };
      path.push(segment);

      if (visitedNodes.has(conn.targetId)) {
        // Cycle — emit path as-is (animateMotion will loop naturally)
        chains.push({ id: path.map(s => s.connection.id).join('-'), segments: [...path] });
      } else {
        visitedNodes.add(conn.targetId);
        dfs(conn.targetId, path, visitedNodes);
        visitedNodes.delete(conn.targetId);
      }

      path.pop();
    }
  }

  dfs(startId, [], new Set([startId]));
}

/**
 * Composes a single continuous SVG path from a flow chain.
 * Uses smart routing for each connection segment, with internal
 * traversals through intermediate components between segments.
 *
 * Returns the path `d` attribute and total length for speed calculation.
 */
export function composeFlowPath(
  segments: FlowChainSegment[],
  toScreen: ScreenMapper,
): { pathD: string; totalLength: number } {
  if (segments.length === 0) return { pathD: '', totalLength: 0 };

  const allPoints: { x: number; y: number }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;

    // Smart route for this connection (canvas-space), then convert to screen
    const routePoints = getSmartRoutePoints(
      seg.source, seg.target,
      seg.connection.sourcePort, seg.connection.targetPort,
    ).map(toScreen);

    if (i === 0) {
      allPoints.push(...routePoints);
    } else {
      // Internal traversal: previous segment ended at target port,
      // this segment starts at source port (different port on same component).
      // Add source port if it differs from last point, then rest of route.
      const first = routePoints[0];
      const last = allPoints[allPoints.length - 1];
      if (first && last && (first.x !== last.x || first.y !== last.y)) {
        allPoints.push(first);
      }
      allPoints.push(...routePoints.slice(1));
    }
  }

  if (allPoints.length < 2) return { pathD: '', totalLength: 0 };

  const first = allPoints[0]!;
  let pathD = `M ${first.x} ${first.y}`;
  let totalLength = 0;

  for (let i = 1; i < allPoints.length; i++) {
    const pt = allPoints[i]!;
    const prev = allPoints[i - 1]!;
    pathD += ` L ${pt.x} ${pt.y}`;
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  return { pathD, totalLength };
}
