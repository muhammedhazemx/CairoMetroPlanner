import { describe, it, expect } from 'vitest';
import { calculateTime } from '../src/lib/time';

describe('calculateTime', () => {
  it('should return 0 minutes for 0 stops', () => {
    expect(calculateTime(0, 0)).toBe(0);
    expect(calculateTime(0, 2)).toBe(0);
  });

  it('should estimate time correctly with no interchanges', () => {
    expect(calculateTime(1, 0)).toBe(2);
    expect(calculateTime(5, 0)).toBe(10);
    expect(calculateTime(15, 0)).toBe(30);
  });

  it('should include interchange penalties (4 mins each) in estimation', () => {
    expect(calculateTime(5, 1)).toBe(14); // 5 stops * 2 = 10 + 4 = 14
    expect(calculateTime(12, 2)).toBe(32); // 12 stops * 2 = 24 + 8 = 32
  });

  it('should return 0 for negative stops input', () => {
    expect(calculateTime(-2, 1)).toBe(0);
  });
});
