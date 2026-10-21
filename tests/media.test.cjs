/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const sharp = require('sharp');
function load(file, mocks = {}, env = { BLOB_READ_WRITE_TOKEN: 'qa-token' }) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name), Buffer, File, console, process: { env } });
  return exports;
}
const policy = load('lib/media-upload-policy.ts');
const optimizer = load('lib/optimize-media.ts', { '@/lib/media-upload-policy': policy });

test('lossless image optimization saves space without changing dimensions or RGBA pixels', async () => {
  const input = await sharp({ create: { width: 500, height: 300, channels: 4, background: { r: 220, g: 20, b: 80, alpha: 0.5 } } }).png({ compressionLevel: 0 }).toBuffer();
  const result = await optimizer.optimizeMedia(input);
  assert.ok(result.buffer.length < input.length);
  assert.equal(result.ext, 'webp');
  const before = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(result.buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual(after.info, before.info);
  assert.deepEqual(after.data, before.data);
});
test('existing compact JPEG, vectors, and animations remain intact when appropriate', async () => {
  const jpeg = await sharp({ create: { width: 1, height: 1, channels: 3, background: 'red' } }).jpeg().toBuffer();
  const result = await optimizer.optimizeMedia(jpeg);
  assert.ok(result.buffer.length <= jpeg.length);
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>');
  assert.deepEqual((await optimizer.optimizeMedia(svg)).buffer, svg);
  const red = await sharp({ create: { width: 8, height: 8, channels: 3, background: 'red' } }).png().toBuffer();
  const blue = await sharp({ create: { width: 8, height: 8, channels: 3, background: 'blue' } }).png().toBuffer();
  const animation = await sharp([red, blue], { join: { animated: true } }).gif({ delay: [100, 100], loop: 0 }).toBuffer();
  assert.equal((await sharp(animation).metadata()).pages, 2);
  assert.deepEqual((await optimizer.optimizeMedia(animation)).buffer, animation);
});
test('invalid, oversized, and decompression-heavy images are rejected', async () => {
  for (const buffer of [Buffer.from('not an image'), Buffer.alloc(0), Buffer.alloc(policy.MAX_MEDIA_BYTES + 1), Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100000" height="100000"/>')]) {
    await assert.rejects(optimizer.optimizeMedia(buffer), optimizer.InvalidMediaError);
  }
});
test('Blob upload saves optimized bytes only under blog-images and lists all pages', async () => {
  let saved;
  let pages = 0;
  const media = load('lib/blog-media.ts', { '@vercel/blob': {
    put: async (name, bytes, options) => { saved = { name, bytes, options }; return { url: `https://qa.public.blob.vercel-storage.com/${name}` }; },
    list: async options => {
      assert.equal(options.prefix, 'blog-images/'); pages++;
      if (!options.cursor) return { blobs: [{ pathname: saved.name, url: `https://qa.public.blob.vercel-storage.com/${saved.name}`, size: saved.bytes.length, uploadedAt: new Date() }], hasMore: true, cursor: 'next' };
      assert.equal(options.cursor, 'next'); return { blobs: [], hasMore: false };
    },
  }, '@/lib/optimize-media': optimizer });
  const input = await sharp({ create: { width: 50, height: 50, channels: 3, background: 'blue' } }).png({ compressionLevel: 0 }).toBuffer();
  const item = await media.uploadMedia(input, 'Blue image.png');
  assert.ok(item.size < input.length);
  assert.equal(item.originalSize, input.length);
  assert.equal(saved.options.contentType, 'image/webp');
  assert.equal(saved.options.access, 'public');
  assert.equal(saved.bytes.length, item.size);
  assert.ok(saved.name.startsWith('blog-images/Blue-image-'));
  assert.equal((await media.listStoredMedia())[0].url, item.url);
  assert.equal(pages, 2);
});
test('missing Blob configuration keeps existing library usable and refuses uploads without a paid fallback', async () => {
  const media = load('lib/blog-media.ts', { '@vercel/blob': { list: () => assert.fail('must not call storage'), put: () => assert.fail('must not call storage') }, '@/lib/optimize-media': optimizer }, {});
  assert.equal((await media.listStoredMedia()).length, 0);
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
  await assert.rejects(media.uploadMedia(svg, 'image.svg'), media.MediaStorageNotConfiguredError);
});
test('upload endpoint enforces permission and size before Storage writes', async () => {
  let allowed = false, writes = 0;
  const route = load('app/api/admin/upload/route.ts', { 'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } }, '@/lib/auth': { requirePermission: async () => ({ ok: allowed, status: 401 }) }, '@/lib/blog-media': { MediaStorageNotConfiguredError: class extends Error {}, uploadMedia: async () => { writes++; return { url: 'https://example.com/image.webp' }; } }, '@/lib/optimize-media': optimizer, '@/lib/media-upload-policy': policy });
  const request = file => ({ formData: async () => new Map([['file', file]]) });
  assert.equal((await route.POST(request(null))).status, 401);
  allowed = true;
  assert.equal((await route.POST(request(new File([Buffer.alloc(policy.MAX_MEDIA_BYTES + 1)], 'large.png', { type: 'image/png' })))) .status, 400);
  assert.equal(writes, 0);
  assert.equal((await route.POST(request(new File(['x'], 'test.png', { type: 'image/png' })))).status, 200);
  assert.equal(writes, 1);
});
