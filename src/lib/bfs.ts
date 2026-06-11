import type { MetroGraph } from './graph';
import type { RouteResult, RouteSegment } from '../types/route';
import { calculateFare } from './fare';
import { calculateTime } from './time';

/**
 * Computes the best route (fewest stops) between origin and destination.
 * If multiple routes have the same number of stops, it selects the one with the fewest interchanges.
 */
export function findRoute(
  graph: MetroGraph,
  originId: string,
  destinationId: string
): RouteResult | null {
  if (!originId || !destinationId) return null;
  if (!graph[originId] || !graph[destinationId]) return null;

  if (originId === destinationId) {
    return {
      path: [originId],
      segments: [],
      totalStops: 0,
      interchanges: [],
      estimatedTime: 0,
      fare: 0
    };
  }

  interface QueueItem {
    stationId: string;
    path: string[];
    linePath: string[]; // line IDs used for each edge transition
    interchangesCount: number;
  }

  const queue: QueueItem[] = [
    {
      stationId: originId,
      path: [originId],
      linePath: [],
      interchangesCount: 0
    }
  ];

  // Records the best { stops, interchanges } to reach a station
  const minStopsToStation: Record<string, { stops: number; interchanges: number }> = {};
  minStopsToStation[originId] = { stops: 0, interchanges: 0 };

  const shortestPaths: QueueItem[] = [];
  let destinationReachedAtStops = Infinity;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const stops = current.path.length - 1;

    // BFS guarantees level-order. If we exceed the shortest path length to destination, we stop.
    if (stops > destinationReachedAtStops) {
      break;
    }

    if (current.stationId === destinationId) {
      destinationReachedAtStops = stops;
      shortestPaths.push(current);
      continue;
    }

    const neighbors = graph[current.stationId] || [];
    for (const neighbor of neighbors) {
      const nextStops = stops + 1;
      const lastLine = current.linePath[current.linePath.length - 1];
      const isInterchange = lastLine !== undefined && lastLine !== neighbor.lineId;
      const nextInterchanges = current.interchangesCount + (isInterchange ? 1 : 0);

      const existing = minStopsToStation[neighbor.stationId];
      if (
        !existing ||
        nextStops < existing.stops ||
        (nextStops === existing.stops && nextInterchanges < existing.interchanges)
      ) {
        minStopsToStation[neighbor.stationId] = {
          stops: nextStops,
          interchanges: nextInterchanges
        };
        queue.push({
          stationId: neighbor.stationId,
          path: [...current.path, neighbor.stationId],
          linePath: [...current.linePath, neighbor.lineId],
          interchangesCount: nextInterchanges
        });
      }
    }
  }

  if (shortestPaths.length === 0) {
    return null;
  }

  // Sort by fewest interchanges to select the best path
  shortestPaths.sort((a, b) => a.interchangesCount - b.interchangesCount);
  const bestPath = shortestPaths[0];

  // Reconstruct segments
  const segments: RouteSegment[] = [];
  const interchanges: string[] = [];

  if (bestPath.path.length > 1) {
    let currentLineId = bestPath.linePath[0];
    let currentSegmentStations: string[] = [bestPath.path[0]];

    for (let i = 0; i < bestPath.linePath.length; i++) {
      const nextStation = bestPath.path[i + 1];
      const nextLineId = bestPath.linePath[i];

      if (nextLineId !== currentLineId) {
        // Commit previous line segment
        segments.push({
          lineId: currentLineId,
          stations: currentSegmentStations
        });

        // The station where we switch is the interchange station
        interchanges.push(bestPath.path[i]);

        // Start new line segment beginning at the transfer station
        currentLineId = nextLineId;
        currentSegmentStations = [bestPath.path[i], nextStation];
      } else {
        currentSegmentStations.push(nextStation);
      }
    }

    // Commit final segment
    if (currentSegmentStations.length > 0) {
      segments.push({
        lineId: currentLineId,
        stations: currentSegmentStations
      });
    }
  }

  const totalStops = bestPath.path.length - 1;
  const fare = calculateFare(totalStops);
  const estimatedTime = calculateTime(totalStops, interchanges.length);

  return {
    path: bestPath.path,
    segments,
    totalStops,
    interchanges,
    estimatedTime,
    fare
  };
}
