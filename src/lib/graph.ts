import type { Line } from '../types/line';

export interface GraphEdge {
  stationId: string;
  lineId: string;
}

export type MetroGraph = Record<string, GraphEdge[]>;

/**
 * Builds a bidirectional adjacency list for the metro network from the lines data.
 */
export function buildGraph(lines: Line[]): MetroGraph {
  const graph: MetroGraph = {};

  lines.forEach(line => {
    const paths = line.paths && line.paths.length > 0 ? line.paths : [line.stations];
    
    paths.forEach(stations => {
      for (let i = 0; i < stations.length; i++) {
        const stationId = stations[i];
        if (!graph[stationId]) {
          graph[stationId] = [];
        }

        // Connect to previous station on this line
        if (i > 0) {
          const prevStationId = stations[i - 1];
          const exists = graph[stationId].some(
            edge => edge.stationId === prevStationId && edge.lineId === line.id
          );
          if (!exists) {
            graph[stationId].push({ stationId: prevStationId, lineId: line.id });
          }
        }

        // Connect to next station on this line
        if (i < stations.length - 1) {
          const nextStationId = stations[i + 1];
          const exists = graph[stationId].some(
            edge => edge.stationId === nextStationId && edge.lineId === line.id
          );
          if (!exists) {
            graph[stationId].push({ stationId: nextStationId, lineId: line.id });
          }
        }
      }
    });
  });

  return graph;
}
