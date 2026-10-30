// Copyright 2026 Quantova Inc
// SPDX-License-Identifier: Apache-2.0 OR MIT
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Q = require('..');
const key = () => Q.generateKey();
const reg = (k, owner) => Q.register({ key: k, assetClass: 'land', identifier: 'Parcel 12 / Block 7', jurisdiction: 'gb', owner: Q.keyId(owner), registrarLabel: 'Land Registry' });

test('a registered asset is a well formed signed record of the registrar', () => {
  const r = key(); const o = key(); const t = reg(r, o);
  assert.strictEqual(t.format, 'qasset/1');
  assert.strictEqual(t.type, 'register');
  assert.strictEqual(t.signer.id, Q.keyId(r));
  assert.strictEqual(t.statement.registrarKeyId, Q.keyId(r));
  assert.strictEqual(t.statement.ownerKeyId, Q.keyId(o));
  assert.match(t.statement.assetId, /^[0-9a-f]{32}$/);
});

test('custody transfer retire chain to the same asset', () => {
  const r = key(); const o = key(); const cust = key(); const buyer = key();
  const t = reg(r, o);
  const held = Q.custody({ key: cust, asset: t, location: 'Warehouse 4' });
  const moved = Q.transfer({ key: o, asset: t, to: Q.keyId(buyer) });
  const gone = Q.retire({ key: r, asset: moved, reason: 'demolished' });
  assert.strictEqual(held.statement.assetId, t.statement.assetId);
  assert.strictEqual(held.statement.assetRef, Q.recordRef(t));
  assert.strictEqual(moved.statement.fromKeyId, Q.keyId(o));
  assert.strictEqual(moved.statement.toKeyId, Q.keyId(buyer));
  assert.strictEqual(gone.statement.registrarKeyId, Q.keyId(r));
});

test('invalid inputs are refused before anything is signed', () => {
  const k = key(); const o = key();
  const base = { key: k, assetClass: 'land', identifier: 'P1', jurisdiction: 'gb', owner: Q.keyId(o) };
  assert.throws(() => Q.register(Object.assign({}, base, { assetClass: 'Land' })), /assetClass must be/);
  assert.throws(() => Q.register(Object.assign({}, base, { jurisdiction: 'GB' })), /jurisdiction must be/);
  assert.throws(() => Q.register(Object.assign({}, base, { identifier: '' })), /identifier is 1 to/);
  assert.throws(() => Q.register(Object.assign({}, base, { extra: 1 })), /is not an option of register/);
});

test('a well formed record verifies and a type mismatch or tamper is invalid', async () => {
  const r = key(); const o = key(); const t = reg(r, o);
  const OPTS = { network: 'testnet', requireAnchor: false, strict: false };
  const ok = await Q.verify(t, Object.assign({ type: 'register' }, OPTS));
  assert.strictEqual(ok.status, 'valid');
  assert.strictEqual(ok.assetId, t.statement.assetId);
  assert.strictEqual((await Q.verify(t, Object.assign({ type: 'transfer' }, OPTS))).status, 'invalid');
  const f = JSON.parse(JSON.stringify(t)); f.statement.jurisdiction = 'us';
  assert.strictEqual((await Q.verify(f, Object.assign({ type: 'register' }, OPTS))).status, 'invalid');
});

test('the prior link binds a record and the kind and constants are pinned', async () => {
  const r = key(); const o = key(); const cust = key();
  const t = reg(r, o);
  const held = Q.custody({ key: cust, asset: t, location: 'Warehouse 4' });
  const good = await Q.verify(held, { type: 'custody', network: 'testnet', requireAnchor: false, strict: false, prior: t });
  assert.ok(good.checks.some((c) => c.name === 'prior' && c.ok));
  assert.strictEqual(Q.KIND, 1304);
  assert.strictEqual(Q.FORMAT, 'qasset/1');
  assert.deepStrictEqual([...Q.TYPES], ['register', 'custody', 'transfer', 'retire']);
});
