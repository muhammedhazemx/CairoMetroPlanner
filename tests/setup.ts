import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically clean up DOM after each test to avoid memory leaks
afterEach(() => {
  cleanup();
});
