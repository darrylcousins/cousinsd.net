import fs from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mockActor from './mock.actor.js';
import { mockServer,
  cleanLogs,
  actor,
  headerStringToObject,
  logString,
  getSigHeaders
} from './server.lib.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

suite("Server inbox tests", async () => {

  let server;

  before(() => {
  });

  after(async () => {
    cleanLogs();
  });

  test('inbox should reject non POST requests', async () => {
    process.env['REQUEST_METHOD'] = 'PUT';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: '',
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('400 Bad Request'));
    assert.match(headers.status, new RegExp('No Post'));
    assert.match(logString('app'), new RegExp('No Post'));
  });

  test('inbox should reject empty data', async () => {
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: '',
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('400 Bad Request'));
    assert.match(headers.status, new RegExp('No Data'));
    assert.match(logString('app'), new RegExp('No Data'));
  });

  test('inbox should reject non json data', async () => {
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: 'Hello',
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('400 Bad Request'));
    assert.match(headers.status, new RegExp('Not JSON Data'));
    assert.match(logString('app'), new RegExp('Not JSON Data'));
  });

  test('inbox should reject non-activitypub data', async () => {
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: '{ "Hello": "World" }',
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('400 Bad Request'));
    assert.match(headers.status, new RegExp('Not ActivityPub Data'));
    assert.match(logString('app'), new RegExp('Not ActivityPub Data'));
  });

  // initialize signature headers
  const data =  {
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Follow",
    "actor": `${mockActor.id}`,
    "object": `${actor}`
  };
  const sigHeaders = getSigHeaders(data);

  test('inbox should fail if signature vaidation fails', async () => {
    // push these into process.env to be picked up by request object headers
    for (const key of Object.keys(sigHeaders)) {
      process.env[`http_${key}`] = sigHeaders[key];
    }
    // force fail by altering reqBody
    const body = JSON.stringify({ ...data, hello: 'world' });

    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: body,
    });
    const parts = output.split('\n\n');
    const headers = headerStringToObject(parts[0].split('\n'));
    const errData = JSON.parse(parts[1]);
    assert.strictEqual(errData.error, 'Signature Validation Failed');
    assert.match(headers.status, new RegExp('401 Signature Validation Failed'));
    assert.match(logString('app'), new RegExp('Signature Validation Failed'));
  });

  test('inbox should accept signature validation', async () => {
    // push these into process.env to be picked up by request object headers
    for (const key of Object.keys(sigHeaders)) {
      process.env[`http_${key}`] = sigHeaders[key];
    }
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const reqBody = JSON.stringify(data);
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: reqBody,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('200 OK'));
    assert.match(logString('app'), new RegExp('Signature validation passed'));
  });

  test('inbox should fail if unable to fetch the actor', async () => {
    // push these into process.env to be picked up by request object headers
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';

    // alter data to give actor a bad url
    const badData = { ...data, actor: 'unacceptable_url' };
    const badHeaders = getSigHeaders(badData);

    for (const key of Object.keys(badHeaders)) {
      process.env[`http_${key}`] = badHeaders[key];
    }
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: JSON.stringify(badData)
    });
    const parts = output.split('\n\n');
    const headers = headerStringToObject(parts[0].split('\n'));
    const errData = JSON.parse(parts[1]);
    assert.strictEqual(errData.error, 'Not Acceptable - Unable to Fetch Actor');
    assert.strictEqual(errData.actor, 'unacceptable_url');
    assert.match(headers.status, new RegExp('406 Not Acceptable - Unable to Fetch Actor'));
    assert.match(logString('app'), new RegExp('Unable to Fetch Actor'));
  });

});

