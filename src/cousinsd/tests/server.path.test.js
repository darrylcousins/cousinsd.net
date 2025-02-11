import fs from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Signature from '../lib/signature.js';
import mockActor from './mock.actor.js';
import { mockServer,
  cleanLogs,
  actor,
  headerStringToObject,
  logString,
  getSigHeaders
} from './server.lib.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

suite("Server path tests", async () => {

  let server;

  before(() => {
  });

  after(async () => {
    cleanLogs();
  });

  test('should get a 404', async () => {
    process.env['HTTP_ACCEPT'] = 'application/json';
    process.env['REQUEST_URI'] = '/cousinsd/nothing';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.match(headers['status'], new RegExp(`404`));
  });

  test('calling run on filepath index for json content', async () => {
    process.env['HTTP_ACCEPT'] = 'application/json';
    process.env['REQUEST_URI'] = '/cousinsd/index';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const obj = JSON.parse(parts[1]);
    assert.strictEqual(obj.id, actor);
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.match(headers['content-type'], new RegExp(`json`));
  });

  test('calling run on filepath index for html content', async () => {
    process.env['HTTP_ACCEPT'] = 'text/html';
    process.env['REQUEST_URI'] = '/cousinsd/index';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.match(headers['content-type'], new RegExp(`text/html`));
  });

  test('calling run on filepath inbox for html content', async () => {
    process.env['HTTP_ACCEPT'] = 'text/html';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.match(headers['content-type'], new RegExp(`text/html`));
    //console.log(output);
    //console.log(logString('app'));
    //console.log(logString('error'));
  });

  test('calling run on filepath none', async () => {
    process.env['HTTP_ACCEPT'] = 'application/json';
    process.env['REQUEST_URI'] = '/cousinsd';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const obj = JSON.parse(parts[1]);
    assert.strictEqual(obj.id, actor);
  });

  test('should fail if not a GET request', async () => {
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('400 Bad Request'));
  });

  test('calling run on filepath profile', async () => {
    process.env['REQUEST_METHOD'] = 'GET';
    process.env['REQUEST_URI'] = '/cousinsd/profile';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const obj = JSON.parse(parts[1]);
    assert.strictEqual(obj.id, `${actor}/profile`);
    assert.strictEqual(obj.actor, actor);
  });

  test('calling run on filepath followers', async () => {
    process.env['REQUEST_URI'] = '/cousinsd/followers';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const obj = JSON.parse(parts[1]);
    assert.strictEqual(obj.id, `${actor}/followers`);
    assert.strictEqual(obj.actor, actor);
  });

  test('calling run on filepath following', async () => {
    process.env['REQUEST_URI'] = '/cousinsd/following';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const obj = JSON.parse(parts[1]);
    assert.strictEqual(obj.id, `${actor}/following`);
    assert.strictEqual(obj.actor, actor);
  });

});



