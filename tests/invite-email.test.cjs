/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks, env = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name), process: { env }, console: { error() {} }, Request, Response });
  return exports;
}
function emailFixture(env, providerError = null) {
  const messages = [];
  const email = load('lib/email.ts', {
    nodemailer: { createTransport: () => ({ sendMail: async message => { messages.push({ provider: 'smtp', ...message }); } }) },
    resend: { Resend: class { emails = { send: async message => { messages.push({ provider: 'resend', ...message }); return { error: providerError }; } }; } },
  }, env);
  return { ...email, messages };
}
test('Gmail Resend senders fail with domain setup guidance before a provider call', async () => {
  const f = emailFixture({ RESEND_API_KEY: 'test', RESEND_FROM_EMAIL: 'Website <owner@gmail.com>' });
  await assert.rejects(f.sendEmail({ to: 'teammate@example.com', subject: 'Invite', html: 'test' }), /RESEND_FROM_EMAIL=.*noreply@bestfreepdfconverter.com/);
  assert.equal(f.messages.length, 0);
});
test('verified-domain sender can address Gmail recipients without rewriting either address', async () => {
  const f = emailFixture({ RESEND_API_KEY: 'test', RESEND_FROM_EMAIL: 'BestFreePDFConverter <noreply@bestfreepdfconverter.com>' });
  await f.sendEmail({ to: 'teammate@gmail.com', subject: 'Invite', html: 'test' });
  assert.equal(f.messages[0].to, 'teammate@gmail.com');
  assert.equal(f.messages[0].from, 'BestFreePDFConverter <noreply@bestfreepdfconverter.com>');
});
test('domain and test-sender failures are not mislabeled as SMTP recipient errors', () => {
  const f = emailFixture({});
  const domain = f.formatEmailError({ message: 'The gmail.com domain is not verified. Please add and verify your domain.' });
  assert.match(domain, /Resend sender domain/);
  const testing = f.formatEmailError({ message: 'You can only send testing emails to your own email address. To send emails to other recipients, verify a domain.' });
  assert.match(testing, /test sender/);
  assert.doesNotMatch(testing, /SMTP/);
});
test('authenticated Gmail SMTP remains usable and has priority over Resend', async () => {
  const f = emailFixture({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'owner@gmail.com', SMTP_PASS: 'test-app-password', RESEND_API_KEY: 'test', RESEND_FROM_EMAIL: 'owner@gmail.com' });
  await f.sendEmail({ to: 'teammate@example.com', subject: 'Invite', html: 'test' });
  assert.equal(f.messages[0].provider, 'smtp');
  assert.equal(f.messages[0].from, 'owner@gmail.com');
});
test('invite failure retains the created account and returns active temporary credentials to the authorized admin', async () => {
  let creates = 0;
  const route = load('app/api/admin/users/route.ts', {
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
    '@/lib/auth': { requirePermission: async () => ({ ok: true }) },
    '@/lib/admin-users': { normalizeEmail: value => value.trim().toLowerCase(), generateTempPassword: () => 'qa-temporary-password', createAdminUser: async opts => { creates++; return { id: 'qa', email: opts.email, active: true }; } },
    '@/lib/admin-permissions': { normalizePermissions: permissions => permissions },
    '@/lib/admin-invite-email': { sendAdminInviteEmail: async () => { throw Error('Domain not verified'); } },
    '@/lib/email': { formatEmailError: () => 'Verify your domain in Resend.' },
  });
  const result = await route.POST(new Request('http://localhost/api/admin/users', { method: 'POST', body: JSON.stringify({ email: 'qa@example.com', permissions: ['blogs'] }) }));
  const data = await result.json();
  assert.equal(result.status, 201);
  assert.equal(creates, 1);
  assert.equal(data.user.active, true);
  assert.equal(data.emailed, false);
  assert.equal(data.tempPassword, 'qa-temporary-password');
  assert.match(data.warning, /Account created and ready to use/);
  assert.doesNotMatch(data.warning, /fixing SMTP/);
});
