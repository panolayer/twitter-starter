import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { relativeTime } from '../lib/time';

const now = Date.UTC(2026, 5, 15, 12);
const ago = (seconds: number) => new Date(now - seconds * 1000).toISOString();

describe('relativeTime', () => {
  it('uses compact units as time passes', () => {
    assert.equal(relativeTime(ago(3), now), 'now');
    assert.equal(relativeTime(ago(42), now), '42s');
    assert.equal(relativeTime(ago(5 * 60), now), '5m');
    assert.equal(relativeTime(ago(3 * 3600), now), '3h');
    assert.equal(relativeTime(ago(2 * 86400), now), '2d');
    assert.equal(relativeTime(ago(14 * 86400), now), '2w');
  });

  it('clamps future timestamps to now', () => {
    assert.equal(relativeTime(ago(-600), now), 'now');
  });

  it('returns an empty string for an invalid timestamp', () => {
    assert.equal(relativeTime('yesterday-ish', now), '');
  });
});
