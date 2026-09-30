import assert from 'node:assert/strict';

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:3000');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(base.hostname), 'Smoke checks only run against a local demo.');
let cookie = '';
let postId;
async function request(path, options = {}, expected = 200) {
  const res = await fetch(new URL(path, base), { ...options, headers: { ...(cookie ? { cookie } : {}), ...options.headers } });
  assert.equal(res.status, expected, `${options.method ?? 'GET'} ${path}`);
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  return res.json();
}
function json(method, body) { return { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }; }
async function switchUser(id) { await request('/api/session', json('POST', { userId: id })); }
const session = await request('/api/session');
const owner = session.users[0];
const other = session.users[1];
assert.ok(owner && other, 'Seeded identities exist');
try {
  await switchUser(owner.id);
  const home = await fetch(new URL('/', base), { headers: { cookie } });
  const html = await home.text();
  assert.equal(home.status, 200);
  const page = await request('/api/feed?algo=recent');
  assert.ok(page.items.length > 0);
  assert.ok(html.includes(page.items[0].text.slice(0, 20)), 'Home contains server-rendered post text');
  assert.ok(page.nextCursor && page.hasMore, 'Sample timeline supports pagination');
  const more = await request(`/api/feed?algo=recent&cursor=${encodeURIComponent(page.nextCursor)}`);
  const firstIds = new Set(page.items.map((post) => post.id));
  assert.ok(more.items.every((post) => !firstIds.has(post.id)), 'Recent pages do not overlap');
  const invalid = await request('/api/posts', json('POST', { text: '   ' }), 400);
  assert.ok(invalid.error.code && invalid.error.message);
  await request('/api/posts/0/bookmark', { method: 'PUT' }, 400);
  await request('/api/posts/12junk/bookmark', { method: 'PUT' }, 400);
  await request('/api/search?q=' + 'a'.repeat(101), {}, 400);
  const created = await request('/api/posts', json('POST', { text: `Smoke check ${Date.now()} #sqlite` }), 201);
  postId = created.post.id;
  assert.equal(created.post.author.id, owner.id);
  for (let i = 0; i < 2; i++) assert.equal((await request(`/api/posts/${postId}/bookmark`, { method: 'PUT' })).bookmarked, true);
  const saved = await request('/api/bookmarks');
  assert.equal(saved.items.filter((post) => post.id === postId).length, 1, 'Repeated saves are idempotent');
  const search = await request('/api/search?q=' + encodeURIComponent(created.post.text));
  assert.equal(search.results[0].bookmarkedByViewer, true, 'Search hydrates viewer state');
  await switchUser(other.id);
  assert.ok(!(await request('/api/bookmarks')).items.some((post) => post.id === postId), 'Bookmarks stay private');
  await request(`/api/posts/${postId}`, { method: 'DELETE' }, 403);
  const liked = await request(`/api/posts/${postId}/like`, { method: 'POST' });
  assert.equal(liked.liked, true);
  assert.equal(liked.likeCount, 1);
  assert.equal((await request(`/api/posts/${postId}/like`, { method: 'POST' })).liked, false);
  for (const path of ['/explore', '/people', '/settings', '/bookmarks', `/profile/${owner.handle}`, `/post/${postId}`]) {
    assert.equal((await fetch(new URL(path, base), { headers: { cookie } })).status, 200, path);
  }
  assert.equal((await fetch(new URL('/post/99999999', base))).status, 404);
  console.log('PASS: SSR, pagination, validation, identity switching, search, bookmarks, likes, ownership, and product pages');
} finally {
  await switchUser(owner.id);
  if (postId) await request(`/api/posts/${postId}`, { method: 'DELETE' });
  await switchUser(session.viewer.id);
}
