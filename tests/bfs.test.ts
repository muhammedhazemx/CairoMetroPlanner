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
    expect(findRoute(graph, 'INVALID_1', '10_HLW_METRO')).toBeNull();
    expect(findRoute(graph, '10_HLW_METRO', 'INVALID_2')).toBeNull();
  });

  it('should return a 0-stop route when origin matches destination', () => {
    const res = findRoute(graph, '10_HLW_METRO', '10_HLW_METRO');
    expect(res).not.toBeNull();
    expect(res!.totalStops).toBe(0);
    expect(res!.path).toEqual(['10_HLW_METRO']);
    expect(res!.segments).toEqual([]);
    expect(res!.interchanges).toEqual([]);
    expect(res!.estimatedTime).toBe(0);
    expect(res!.fare).toBe(0);
  });

  it('should compute a simple single-line route (Line 1: Helwan -> Maadi)', () => {
    // Helwan is 10_HLW_METRO, Maadi is 23_MAD_METRO
    const res = findRoute(graph, '10_HLW_METRO', '23_MAD_METRO');
    expect(res).not.toBeNull();
    expect(res!.totalStops).toBe(10); // 10 edges: Helwan to Maadi
    expect(res!.interchanges).toEqual([]); // No transfers
    expect(res!.segments).toHaveLength(1);
    expect(res!.segments[0].lineId).toBe('L1');
    expect(res!.segments[0].stations[0]).toBe('10_HLW_METRO');
    expect(res!.segments[0].stations[res!.segments[0].stations.length - 1]).toBe('23_MAD_METRO');
  });

  it('should compute a route requiring 1 interchange (Line 1 to Line 2: Helwan -> Giza)', () => {
    // Helwan is 10_HLW_METRO (L1)
    // El-Giza is 457_GIZ_METRO (L2)
    // They should interchange at Sadat (86_SAD_METRO) or Al-Shohadaa (100_SHO_METRO)
    // BFS will choose Sadat since it is closer
    const res = findRoute(graph, '10_HLW_METRO', '457_GIZ_METRO');
    expect(res).not.toBeNull();
    expect(res!.interchanges).toContain('86_SAD_METRO');
    expect(res!.segments).toHaveLength(2);
    expect(res!.segments[0].lineId).toBe('L1');
    expect(res!.segments[1].lineId).toBe('L2');
  });

  it('should compute a route requiring 2 interchanges (Line 1 to Line 3: New El-Marg -> Al-Ahram)', () => {
    // New El-Marg is 251_NMR_METRO (L1)
    // Al-Ahram is 214_AHR_METRO (L3)
    // Route: L1 (New El-Marg -> Al-Shohadaa) -> L2 (Al-Shohadaa -> Attaba) -> L3 (Attaba -> Al-Ahram)
    const res = findRoute(graph, '251_NMR_METRO', '214_AHR_METRO');
    expect(res).not.toBeNull();
    expect(res!.interchanges).toContain('100_SHO_METRO');
    expect(res!.interchanges).toContain('81_ATT_METRO');
    expect(res!.segments).toHaveLength(3);
    expect(res!.segments[0].lineId).toBe('L1');
    expect(res!.segments[1].lineId).toBe('L2');
    expect(res!.segments[2].lineId).toBe('L3');
  });
});
