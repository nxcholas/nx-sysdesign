import type { Connection, PaletteItemKind } from './types';
import { getSmartRoutePoints } from './connection-utils';

/** Consistent animation speed in screen-space pixels per second. */
export const FLOW_SPEED = 150;

/** Any entity that can be a connection endpoint (component or frame). */
export type FlowEntity = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: PaletteItemKind;
};

export interface FlowChainSegment {
  connection: Connection;
  source: FlowEntity;
  target: FlowEntity;
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
  entities: FlowEntity[],
): FlowChain[] {
  if (connections.length === 0) return [];

  const entityMap = new Map(entities.map(e => [e.id, e]));

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

  // For each connected component, find ALL roots and trace paths from each
  const chains: FlowChain[] = [];

  for (const group of groups) {
    const groupSet = new Set(group);
    const groupConnections = connections.filter(
      c => groupSet.has(c.sourceId) && groupSet.has(c.targetId)
    );

    const roots = findRoots(group, groupConnections);

    if (roots.length === 0) {
      // Fully cyclic — fall back to a single arbitrary start
      const fallback = group[0];
      if (fallback) tracePaths(fallback, outgoing, entityMap, chains);
      continue;
    }

    // DFS from every root so every source node gets its own bubble
    for (const root of roots) {
      tracePaths(root, outgoing, entityMap, chains);
    }
  }

  return chains;
}

/**
 * Finds all root nodes of a connected component — nodes with in-degree 0.
 * Returns an empty array if the component is fully cyclic.
 */
function findRoots(
  group: string[],
  groupConnections: Connection[],
): string[] {
  const inDegree = new Map<string, number>();
  for (const id of group) inDegree.set(id, 0);
  for (const conn of groupConnections) {
    inDegree.set(conn.targetId, (inDegree.get(conn.targetId) || 0) + 1);
  }
  return group.filter((id) => inDegree.get(id) === 0);
}

/**
 * DFS from a root node, following outgoing connections.
 * Branches produce separate chains. Cycles are detected and terminated.
 */
function tracePaths(
  startId: string,
  outgoing: Map<string, Connection[]>,
  entityMap: Map<string, FlowEntity>,
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
      const source = entityMap.get(conn.sourceId);
      const target = entityMap.get(conn.targetId);
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
  obstacles?: { x: number; y: number; width: number; height: number }[],
): { pathD: string; totalLength: number } {
  if (segments.length === 0) return { pathD: '', totalLength: 0 };

  const allPoints: { x: number; y: number }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;

    // Smart route for this connection (canvas-space), then convert to screen
    const segObstacles = (obstacles ?? []).filter(
      o => o !== seg.source && o !== seg.target
    );
    const routePoints = getSmartRoutePoints(
      seg.source, seg.target,
      seg.connection.sourcePort, seg.connection.targetPort,
      segObstacles,
    ).map(toScreen);

    if (i === 0) {
      allPoints.push(...routePoints);
    } else {
      // Insert orthogonal waypoints through the intermediate component's center
      // to avoid a diagonal cut between the arrival port and departure port.
      // Path: lastPt → (center.x, lastPt.y) → (center.x, firstPt.y) → firstPt
      const intermediateEntity = segments[i - 1]!.target;
      const centerScreen = toScreen({
        x: intermediateEntity.x + intermediateEntity.width / 2,
        y: intermediateEntity.y + intermediateEntity.height / 2,
      });

      const lastPt = allPoints[allPoints.length - 1]!;
      const firstPt = routePoints[0];

      if (firstPt) {
        const wp1 = { x: centerScreen.x, y: lastPt.y };
        const wp2 = { x: centerScreen.x, y: firstPt.y };
        if (wp1.x !== lastPt.x || wp1.y !== lastPt.y) allPoints.push(wp1);
        if (wp2.x !== wp1.x || wp2.y !== wp1.y) allPoints.push(wp2);
        if (wp2.x !== firstPt.x || wp2.y !== firstPt.y) allPoints.push(firstPt);
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
