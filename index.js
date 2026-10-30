// Copyright 2026 Quantova Inc
// SPDX-License-Identifier: Apache-2.0 OR MIT

'use strict';

const A = require('./lib/asset');
const { verify } = require('./lib/verify');
const F = require('./lib/format');

module.exports = {
  generateKey: A.generateKey,
  publicKey: A.publicKey,
  keyId: A.keyId,
  describeKey: A.describeKey,
  assetRef: A.assetRef,
  register: A.register,
  custody: A.custody,
  transfer: A.transfer,
  retire: A.retire,
  anchor: A.anchor,
  complete: A.complete,
  verify,
  anchorDigest: (envelope) => F.anchorDigest(F.parse(envelope)).toString('hex'),
  recordRef: (envelope) => F.refOf(F.parse(envelope)),
  FORMAT: F.FORMAT,
  ALGORITHM: F.ALGORITHM,
  KIND: F.KIND,
  TYPES: F.TYPES,
  PUBLIC_KEY_BYTES: F.PUBLIC_KEY_BYTES,
  SIGNATURE_BYTES: F.SIGNATURE_BYTES,
};
