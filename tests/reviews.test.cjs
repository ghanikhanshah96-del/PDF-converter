/* eslint-disable @typescript-eslint/no-require-imports -- This Node test harness executes CommonJS modules with mocked dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name),
    process, console, Request, Response, URL, ReadableStream, TextEncoder, setInterval, clearInterval, setTimeout, clearTimeout }, { filename: file });
  return exports;
}
const policy = load('lib/review-policy.ts');

function fixture() {
  const records = new Map();
  const emails = [];
  let allowed = true;
  const db = {
    collection: () => ({
      doc: id => ({ set: async data => records.set(id, data), update: async data => Object.assign(records.get(id), data) }),
      where: () => ({ get: async () => ({ docs: [...records].map(([id, data]) => ({ id, data: () => data })) }) }),
    }),
    runTransaction: async callback => callback({ get: async () => ({ data: () => ({ count: allowed ? 0 : 5 }) }), set: () => {} }),
  };
  const firebase = { getDb: () => db, isFirebaseAdminConfigured: () => true };
  const repo = load('lib/reviews-repo.ts', { '@/lib/firebase-admin': firebase, '@/lib/review-policy': policy });
  const route = load('app/api/reviews/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/reviews-repo': repo, '@/lib/firebase-admin': firebase,
    '@/lib/email': { sendEmail: async email => emails.push(email) },
  });
  const submit = body => route.POST(new Request('http://localhost/api/reviews', {
    method: 'POST', headers: { origin: 'http://localhost' }, body: JSON.stringify(body),
  }));
  return { records, emails, route, submit, deny: () => { allowed = false; } };
}

test('all ratings persist; only 4–5 publish; only 1–3 send email', async () => {
  const f = fixture();
  for (let rating = 1; rating <= 5; rating++) {
    const response = await f.submit({ name: 'Reader', rating, comment: '<script>feedback</script>' });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).published, rating > 3);
  }
  assert.equal(f.records.size, 5);
  assert.equal(f.emails.length, 3);
  assert.ok(f.emails.every(email => !email.html.includes('<script>')));
  const publicResponse = await f.route.GET();
  const publicReviews = (await publicResponse.json()).reviews;
  assert.deepEqual(publicReviews.map(r => r.rating).sort(), [4, 5]);
  assert.ok(publicReviews.every(r => !('notificationStatus' in r)));
  assert.ok([...f.records.values()].filter(r => r.rating <= 3).every(r => !r.published && r.notificationStatus === 'sent'));
});

test('old published 3-star reviews, private reviews and malformed records never leak', () => {
  const data = { published: true, rating: 5, name: 'Reader', comment: 'Helpful', createdAt: new Date().toISOString(), notificationStatus: 'sent' };
  const output = policy.selectPublicReviews([
    { id: 'good', data }, { id: 'old-three', data: { ...data, rating: 3 } },
    { id: 'private', data: { ...data, published: false } },
    { id: 'bad-date', data: { ...data, createdAt: null } },
  ]);
  assert.equal(output.length, 1);
  assert.equal(output[0].id, 'good');
  assert.equal('notificationStatus' in output[0], false);
});

test('invalid ratings and exhausted rate limits cannot save reviews or send email', async () => {
  const f = fixture();
  assert.equal((await f.submit({ name: 'Reader', rating: 3.5, comment: 'Test' })).status, 400);
  f.deny();
  assert.equal((await f.submit({ name: 'Reader', rating: 5, comment: 'Test' })).status, 429);
  assert.equal(f.records.size, 0);
  assert.equal(f.emails.length, 0);
});

test('email failures retain private feedback and record failed delivery', async () => {
  const f = fixture();
  const repo = load('lib/reviews-repo.ts', {
    '@/lib/firebase-admin': { getDb: () => ({ collection: () => ({ doc: id => ({
      set: async data => f.records.set(id, data),
      update: async data => Object.assign(f.records.get(id), data),
    }) }) }), isFirebaseAdminConfigured: () => true }, '@/lib/review-policy': policy,
  });
  const db = { collection: () => ({ doc: id => ({ update: async data => Object.assign(f.records.get(id), data) }) }),
    runTransaction: async () => true };
  const route = load('app/api/reviews/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/reviews-repo': repo, '@/lib/firebase-admin': { getDb: () => db },
    '@/lib/email': { sendEmail: async () => { throw new Error('Delivery unavailable'); } },
  });
  const response = await route.POST(new Request('http://localhost/api/reviews', {
    method: 'POST', body: JSON.stringify({ name: 'Reader', rating: 3, comment: 'Needs work' }),
  }));
  assert.equal(response.status, 201);
  assert.equal(f.records.size, 1);
  const saved = [...f.records.values()][0];
  assert.equal(saved.notificationStatus, 'failed');
  assert.equal(saved.published, false);
});

test('live stream filters low ratings, forwards changes and detaches on disconnect', async () => {
  let listener;
  let detached = 0;
  const route = load('app/api/reviews/stream/route.ts', {
    '@/lib/firebase-admin': { isFirebaseAdminConfigured: () => true, getDb: () => ({ collection: () => ({ where: () => ({
      onSnapshot: callback => { listener = callback; return () => { detached++; }; },
    }) }) }) },
    '@/lib/reviews-repo': { REVIEWS_COLLECTION: 'userReviews' }, '@/lib/review-policy': policy,
  });
  const response = route.GET(new Request('http://localhost/api/reviews/stream'));
  assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
  const reader = response.body.getReader();
  await reader.read(); // retry interval
  const data = { name: 'Reader', comment: 'Useful', rating: 5, published: true, createdAt: new Date().toISOString() };
  listener({ docs: [{ id: 'good', data: () => data }, { id: 'three', data: () => ({ ...data, rating: 3 }) }] });
  const first = new TextDecoder().decode((await reader.read()).value);
  assert.ok(first.includes('"id":"good"'));
  assert.ok(!first.includes('"id":"three"'));
  listener({ docs: [] });
  const removed = new TextDecoder().decode((await reader.read()).value);
  assert.ok(removed.includes('"reviews":[]'));
  await reader.cancel();
  assert.equal(detached, 1);
});

test('admin feedback API rejects anonymous and unauthorized users', async () => {
  let reads = 0;
  for (const status of [401, 403]) {
    const route = load('app/api/admin/reviews/route.ts', {
      'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
      '@/lib/auth': { requirePermission: async permission => { assert.equal(permission, 'reviews'); return {ok:false,status}; } },
      '@/lib/reviews-repo': { listAdminReviews: async () => { reads++; return []; } },
    });
    assert.equal((await route.GET()).status, status);
  }
  assert.equal(reads, 0);
});

test('authorized admins can see low ratings and notification failures', async () => {
  const route = load('app/api/admin/reviews/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/auth': { requirePermission: async () => ({ok:true}) },
    '@/lib/reviews-repo': { listAdminReviews: async () => [{id:'private',rating:2,published:false,notificationStatus:'failed'}] },
  });
  const response = await route.GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await response.json()).reviews[0].rating, 2);
});

test('reviews permission applies to its page and nested paths', () => {
  const permissions = load('lib/admin-permissions.ts');
  assert.equal(permissions.permissionForPath('/admin/reviews'), 'reviews');
  assert.equal(permissions.permissionForPath('/admin/reviews/details'), 'reviews');
  assert.equal(permissions.hasPermission(['blogs'], 'reviews', false), false);
  assert.equal(permissions.hasPermission(['reviews'], 'reviews', false), true);
});
