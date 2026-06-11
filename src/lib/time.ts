/**
 * Estimates the travel time in minutes.
 * - 2 minutes per stop
 * - Add 4 minutes per interchange
 */
export function calculateTime(stopsCount: number, interchangeCount: number): number {
  if (stopsCount <= 0) return 0;
  return stopsCount * 2 + interchangeCount * 4;
}
