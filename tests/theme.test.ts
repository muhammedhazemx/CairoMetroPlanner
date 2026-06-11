import { describe, it, expect, beforeEach, vi } from 'vitest';
import themeReducer, { toggleTheme, setTheme, ThemeMode } from '../src/features/theme/themeSlice';

describe('themeSlice', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear();
  });

  it('should return initial state', () => {
    const initialState = themeReducer(undefined, { type: 'unknown' });
    expect(initialState.mode).toBeDefined();
    expect(['light', 'dark']).toContain(initialState.mode);
  });

  it('should handle toggleTheme from light to dark', () => {
    const state = { mode: 'light' as ThemeMode };
    const nextState = themeReducer(state, toggleTheme());
    expect(nextState.mode).toBe('dark');
  });

  it('should handle toggleTheme from dark to light', () => {
    const state = { mode: 'dark' as ThemeMode };
    const nextState = themeReducer(state, toggleTheme());
    expect(nextState.mode).toBe('light');
  });

  it('should handle setTheme', () => {
    const state = { mode: 'light' as ThemeMode };
    const nextState = themeReducer(state, setTheme('dark'));
    expect(nextState.mode).toBe('dark');
  });
});
