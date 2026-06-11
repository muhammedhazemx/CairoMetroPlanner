import { describe, it, expect } from 'vitest';
import { calculateFare } from '../src/lib/fare';

describe('calculateFare', () => {
  it('should return 0 EGP for 0 stops', () => {
    expect(calculateFare(0)).toBe(0);
  });

  it('should return 9 EGP for 1 to 9 stops', () => {
    expect(calculateFare(1)).toBe(9);
    expect(calculateFare(5)).toBe(9);
    expect(calculateFare(9)).toBe(9);
  });

  it('should return 12 EGP for 10 to 16 stops', () => {
    expect(calculateFare(10)).toBe(12);
    expect(calculateFare(13)).toBe(12);
    expect(calculateFare(16)).toBe(12);
  });

  it('should return 15 EGP for 17 or more stops', () => {
    expect(calculateFare(17)).toBe(15);
    expect(calculateFare(25)).toBe(15);
    expect(calculateFare(40)).toBe(15);
  });

  it('should handle negative numbers gracefully by returning 0', () => {
    expect(calculateFare(-5)).toBe(0);
  });
});
