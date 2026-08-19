import { describe, expect, it, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage } from './storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads JSON values', () => {
    saveToStorage('test-key', { provider: 'google' });

    expect(loadFromStorage('test-key', null)).toEqual({ provider: 'google' });
  });

  it('returns the fallback for invalid stored JSON', () => {
    localStorage.setItem('test-key', '{invalid');

    expect(loadFromStorage('test-key', ['fallback'])).toEqual(['fallback']);
  });
});
