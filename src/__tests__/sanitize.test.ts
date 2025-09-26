import { sanitizeInput } from '@/utils/sanitize';

describe('sanitizeInput', () => {
  it('removes angle brackets and backticks and trims', () => {
    expect(sanitizeInput('  <test>`abc`>  ')).toBe('testabc');
  });
});
