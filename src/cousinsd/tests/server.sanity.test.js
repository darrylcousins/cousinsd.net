import fs from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Signature from '../lib/signature.js';
import mockActor from './mock.actor.js';
import { mockServer, logString, cleanLogs, actor, headerStringToObject } from './server.lib.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

suite("Server sanity tests", async () => {

  let server;

  before(() => {
  });

  after(async () => {
    cleanLogs();
  });

  test('calling close should send headers', async () => {
    const output = await mockServer({
      method: 'close',
      data: null,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    // default status is 200 OK
    assert.strictEqual(headers.status, '200 OK');
  });

  test('calling close with a status other than 200', async () => {
    const output = await mockServer({
      method: 'close',
      data: '500 Server Error',
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    // default status is 200 OK
    assert.strictEqual(headers.status, '500 Server Error');
  });

  test('calling with an error should log error and send headers with error status', async () => {
    const output = await mockServer({
      method: 'error',
      data: new Error('my new error'),
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.strictEqual(headers.status, '500 Server Error');
    assert.match(logString('error'), new RegExp('my new error'));
  });

  test('content-type should depend on http_accept header', async () => {
    process.env['HTTP_ACCEPT'] = 'text/html';
    const output = await mockServer({
      method: 'close',
      data: null,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    // default status is 200 OK
    assert.strictEqual(headers.status, '200 OK');
  });

});


