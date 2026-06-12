import { describe, it, expect, beforeAll } from 'vitest';
import { lines } from '../src/data/lines';
import { buildGraph, MetroGraph } from '../src/lib/graph';
import { findRoute } from '../src/lib/bfs';

describe('findRoute pathfinder', () => {
  let graph: MetroGraph;

  beforeAll(() => {
    graph = buildGraph(lines);
  });

  it('should return null if stations do not exist', () => {
    expect(findRoute(graph, 'INVALID_1', 'L1_HEL')).toBeNull();
    expect(findRoute(graph, 'L1_HEL', 'INVALID_2')).toBeNull();
  });

  it('should return a 0-stop route when origin matches destination', () => {
    const res = findRoute(graph, 'L1_HEL', 'L1_HEL');
    expect(res).not.toBeNull();
    expect(res!.totalStops).toBe(0);
    expect(res!.path).toEqual(['L1_HEL']);
    expect(res!.segments).toEqual([]);
    expect(res!.interchanges).toEqual([]);
    expect(res!.estimatedTime).toBe(0);
    expect(res!.fare).toBe(0);
  });

  it('should compute a simple single-line route (Line 1: Helwan -> Maadi)', () => {
    const res = findRoute(graph, 'L1_HEL', 'L1_MAD');
    expect(res).not.toBeNull();
    expect(res!.totalStops).toBe(10); // 10 edges: Helwan to Maadi
    expect(res!.interchanges).toEqual([]); // No transfers
    expect(res!.segments).toHaveLength(1);
    expect(res!.segments[0].lineId).toBe('L1');
    expect(res!.segments[0].stations[0]).toBe('L1_HEL');
    expect(res!.segments[0].stations[res!.segments[0].stations.length - 1]).toBe('L1_MAD');
  });

  it('should compute a route requiring 1 interchange (Line 1 to Line 2: Helwan -> Giza)', () => {
    const res = findRoute(graph, 'L1_HEL', 'L2_GIZ');
    expect(res).not.toBeNull();
    expect(res!.interchanges).toContain('L1_SAD');
    expect(res!.segments).toHaveLength(2);
    expect(res!.segments[0].lineId).toBe('L1');
    expect(res!.segments[1].lineId).toBe('L2');
  });

  it('should route across the Kit Kat junction (Cairo University L3 -> Rod El Farag Corridor)', () => {
    // This goes from West Branch to North Branch, so it must switch at Kit Kat
    const res = findRoute(graph, 'L3_CAI', 'L3_ROD');
    expect(res).not.toBeNull();
    expect(res!.interchanges).toEqual([]); // Same line
    expect(res!.path).toContain('L3_KIT'); // Must pass through Kit Kat
    expect(res!.totalStops).toBe(11); // Cairo Univ(1) -> Boulak(2) -> Gamat(3) -> Wadi(4) -> Tawfikia(5) -> Kit Kat(6) -> Sudan(7) -> Imbaba(8) -> Bohy(9) -> Qawmia(10) -> Ring(11) -> Rod(12). Wait: indices 0 to 11 = 11 edges.
    expect(res!.segments).toHaveLength(1);
    expect(res!.segments[0].lineId).toBe('L3');
  });

  it('should use the new Cairo University interchange (L2 -> L3)', () => {
    // El-Mounib (L2) -> Tawfikia (L3)
    // Faster to take L2 to Cairo University, then transfer to L3.
    const res = findRoute(graph, 'L2_MON', 'L3_TAW');
    expect(res).not.toBeNull();
    expect(res!.interchanges).toContain('L3_CAI');
    expect(res!.segments).toHaveLength(2);
    expect(res!.segments[0].lineId).toBe('L2');
    expect(res!.segments[1].lineId).toBe('L3');
  });
});
