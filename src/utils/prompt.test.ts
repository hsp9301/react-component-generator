import { describe, expect, it } from 'vitest';
import { isPromptWithinLimit } from './prompt';

describe('isPromptWithinLimit', () => {
  it('accepts prompts up to 500 characters', () => {
    expect(isPromptWithinLimit('a'.repeat(500))).toBe(true);
  });

  it('rejects prompts longer than 500 characters', () => {
    expect(isPromptWithinLimit('a'.repeat(501))).toBe(false);
  });
});
