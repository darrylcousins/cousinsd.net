import crypto from 'node:crypto';
import fs from 'node:fs';
import { suite, test, before, after } from 'node:test';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

import Signature from '../lib/signature.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

suite("Signature sanity tests", async () => {

  before(() => {
  });

  after(async () => {
  });

  test('match the digest string', async () => {
    const signature = new Signature();
    const reqBody = "{'bleh': 'blah'}";
    const digest = "SHA-256=" + crypto
      .createHash("sha256")
      .update(reqBody)
      .digest("base64");
    assert.strictEqual(digest, signature.getDigest(reqBody));
  });

  test('match the headers', async () => {
    const signature = new Signature();
    const reqBody = "{'bleh': 'blah'}";
    const actor = 'https://activitypub.nz/darryl';
    const keyId = `${actor}/publicKey`;
    const inbox = `${actor}/inbox`;
    const privateKey = fs.readFileSync(join(__dirname, 'test-private.pem'));
    const headers = signature.headers({ inbox, reqBody, privateKey, keyId });
    assert.ok(Object.keys(headers).includes('date'));
    assert.ok(Object.keys(headers).includes('host'));
    assert.ok(Object.keys(headers).includes('signature'));
  });

});

