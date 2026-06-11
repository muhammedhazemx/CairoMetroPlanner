/**
 * Calculates the Cairo Metro ticket fare in Egyptian Pounds (EGP) based on the number of stops.
 * - 9 EGP for 1-9 stops
 * - 12 EGP for 10-16 stops
 * - 15 EGP for 17+ stops
 */
export function calculateFare(stopsCount: number): number {
  if (stopsCount <= 0) return 0;
  if (stopsCount <= 9) return 9;
  if (stopsCount <= 16) return 12;
  return 15;
}
