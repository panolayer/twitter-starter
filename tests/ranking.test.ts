import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_GRAVITY, engagementScore, timeDecayScore } from '../lib/ranking';

const HOUR = 60 * 60 * 1000;
const now = Date.UTC(2026, 5, 1, 12);
const hoursAgo = (hours: number) => new Date(now - hours * HOUR).toISOString();

describe('engagementScore', () => {
  it('weights likes 1, reposts 2 and replies 1.5', () => {
    assert.equal(engagementScore({ likeCount: 3, repostCount: 2, replyCount: 2 }), 10);
  });

  it('never goes below zero', () => {
    assert.equal(engagementScore({ likeCount: -4, repostCount: 0, replyCount: -1 }), 0);
  });
});

describe('timeDecayScore', () => {
  it('divides engagement + 1 by (ageHours + 2)^1.5', () => {
    const score = timeDecayScore(hoursAgo(2), now, 7);
    assert.ok(Math.abs(score - 8 / Math.pow(4, DEFAULT_GRAVITY)) < 1e-12);
  });

  it('clamps future timestamps to an age of zero', () => {
    assert.equal(timeDecayScore(hoursAgo(-5), now, 0), timeDecayScore(hoursAgo(0), now, 0));
  });

  it('treats an unparseable timestamp as brand new instead of dividing by zero', () => {
    const score = timeDecayScore('not a date', now, 1);
    assert.ok(Number.isFinite(score));
    assert.equal(score, 2 / Math.pow(2, DEFAULT_GRAVITY));
  });

  it('ranks an older post below a newer one with equal engagement', () => {
    assert.ok(timeDecayScore(hoursAgo(1), now, 3) > timeDecayScore(hoursAgo(10), now, 3));
  });

  it('is deterministic for the same inputs', () => {
    assert.equal(timeDecayScore(hoursAgo(3), now, 4), timeDecayScore(hoursAgo(3), now, 4));
  });
});
