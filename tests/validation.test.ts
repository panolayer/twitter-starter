import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_POST_LENGTH,
  extForType,
  validateCreatePost,
  validateHandle,
  validateImageUpload,
  validatePositiveId,
  validateProfileUpdate,
  validateSearchQuery,
} from '../lib/validation';

describe('validateCreatePost', () => {
  it('trims text and accepts an uploaded image path', () => {
    assert.deepEqual(validateCreatePost({ text: '  hello  ', imageUrl: '/uploads/a.png' }), {
      ok: true,
      value: { text: 'hello', imageUrl: '/uploads/a.png' },
    });
  });

  it('rejects empty, missing and overlong text', () => {
    assert.equal(validateCreatePost({ text: '   ' }).ok, false);
    assert.equal(validateCreatePost({}).ok, false);
    assert.equal(validateCreatePost(null).ok, false);
    assert.equal(validateCreatePost({ text: 'x'.repeat(MAX_POST_LENGTH + 1) }).ok, false);
    assert.equal(validateCreatePost({ text: 'x'.repeat(MAX_POST_LENGTH) }).ok, true);
  });

  it('only accepts image paths under /uploads/', () => {
    assert.equal(
      validateCreatePost({ text: 'hi', imageUrl: 'https://example.com/a.png' }).ok,
      false,
    );
    assert.equal(validateCreatePost({ text: 'hi', imageUrl: 42 }).ok, false);
    assert.deepEqual(validateCreatePost({ text: 'hi', imageUrl: '' }).value, {
      text: 'hi',
      imageUrl: null,
    });
  });
});

describe('validateImageUpload', () => {
  it('accepts a supported image within the size limit', () => {
    assert.deepEqual(validateImageUpload({ contentType: 'image/png', size: 10 }), {
      ok: true,
      value: { ext: 'png' },
    });
  });

  it('rejects unsupported types, empty files and oversized files', () => {
    assert.equal(validateImageUpload({ contentType: 'text/html', size: 10 }).ok, false);
    assert.equal(validateImageUpload({ contentType: 'image/png', size: 0 }).ok, false);
    assert.equal(
      validateImageUpload({ contentType: 'image/png', size: 6 * 1024 * 1024 }).ok,
      false,
    );
  });

  it('maps content types to file extensions', () => {
    assert.equal(extForType('image/jpeg'), 'jpg');
    assert.equal(extForType('image/svg+xml'), 'svg');
    assert.equal(extForType('application/pdf'), 'bin');
  });
});

describe('small boundary validators', () => {
  it('validateSearchQuery trims and caps at 100 characters', () => {
    assert.deepEqual(validateSearchQuery('  sqlite '), { ok: true, value: 'sqlite' });
    assert.equal(validateSearchQuery('a'.repeat(101)).ok, false);
  });

  it('validatePositiveId accepts only positive integers', () => {
    assert.equal(validatePositiveId('12'), 12);
    assert.equal(validatePositiveId('0'), null);
    assert.equal(validatePositiveId('12junk'), null);
    assert.equal(validatePositiveId('-3'), null);
  });

  it('validateHandle normalizes a leading @ and case', () => {
    assert.equal(validateHandle('@Grace'), 'grace');
    assert.equal(validateHandle('9lives'), null);
  });

  it('validateProfileUpdate trims and bounds name and bio', () => {
    assert.deepEqual(validateProfileUpdate({ displayName: ' Ada ', bio: ' hi ' }), {
      ok: true,
      value: { displayName: 'Ada', bio: 'hi' },
    });
    assert.equal(validateProfileUpdate({ displayName: '', bio: '' }).ok, false);
    assert.equal(validateProfileUpdate({ displayName: 'Ada', bio: 'x'.repeat(161) }).ok, false);
  });
});
