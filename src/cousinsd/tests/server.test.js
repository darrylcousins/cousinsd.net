import fs from 'node:fs';
import { Worker } from 'node:worker_threads';
import { Readable } from 'node:stream';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MockAgent, setGlobalDispatcher } from 'undici';
import Signature from '../lib/signature.js';
import mockActor from './mock.actor.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

suite("Server sanity tests", async () => {

  let server;
  const actor = 'https://cousinsd.net/cousinsd';

  before(() => {
  });

  after(async () => {
    if (fs.existsSync(`${process.env.LOG_PATH}/app.log`)) {
      fs.unlinkSync(`${process.env.LOG_PATH}/app.log`);
    }
    if (fs.existsSync(`${process.env.LOG_PATH}/access.log`)) {
      fs.unlinkSync(`${process.env.LOG_PATH}/access.log`);
    }
    if (fs.existsSync(`${process.env.LOG_PATH}/error.log`)) {
      fs.unlinkSync(`${process.env.LOG_PATH}/error.log`);
    }
  });

  /*
   * Helper method
   * Return key: value object from array of key: value strings
   * Ignores empty lines
   */
  const headerStringToObject = (arr) => {
    arr = arr.filter(el => el != '');
    let result = {};
    arr.map(el => {
      const parts = el.split(':').map(el => el.trim());
      result[parts[0]] = parts[1];
    });
    return result;
  };

  /*
   * Helper method
   * Worker for mock process and returns stdout as a string
   */
  const mockServer = async (data, input) => {
    let stdin = input ? true : false;
    return new Promise((resolve, reject) => {
      let output = '';
      const worker = new Worker(join(__dirname, 'mock.server.js'), {
        stdout: true,
        stdin,
        workerData: data,
      });
      if (stdin) {
        const readable = new Readable();
        readable._read = function () {};
        readable.push(input.data);
        readable.push(null);
        readable.pipe(worker.stdin);
      }
      /* node:coverage disable */
      worker.on('error', (err) => {
        reject(err);
      });
      /* node:coverage enable */
      worker.stdout.on('data', (msg) => {
        output += msg.toString();
      });
      worker.stdout.on('close', (msg) => {
        //cb(output);
        resolve(output);
      });
    });
  };

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
    const data = fs.readFileSync(`${process.env.LOG_PATH}/error.log`);
    const logString = data.toString();
    assert.match(logString, new RegExp('my new error'));
  });

  test('calling run on filepath index', async () => {
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const obj = JSON.parse(parts[1]);
    assert.strictEqual(obj.id, actor);
  });

  test('calling run on filepath none', async () => {
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

  test('calling run on filepath publickey', async () => {
    process.env['REQUEST_URI'] = '/cousinsd/publickey';
    const output = await mockServer({
      method: 'run',
      data: null,
    });
    const parts = output.split('\n\n'); // split after headers
    const obj = JSON.parse(parts[1]);
    assert.strictEqual(obj.id, `${actor}/publickey`);
    assert.strictEqual(obj.owner, `${actor}/index`);
  });

  test('inbox should reject non POST requests', async () => {
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
    /*
    if (fs.existsSync(`${process.env.LOG_PATH}/app.log`)) {
      const data = fs.readFileSync(`${process.env.LOG_PATH}/app.log`);
      const logString = data.toString();
      console.log(logString);
    }
    */
  });

  /*
   * Need to mock fetch request the actor given here
   * Need to build a signature using the actor here and the keys
   */
  const signature = new Signature();
  const data =  {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Follow",
      "actor": `${mockActor.id}`,
      "object": `${actor}`
    };
  let reqBody = JSON.stringify(data);
  const inbox = `${actor}/inbox`;
  //const sig = signature.sign(reqBody);
  const privateKey = fs.readFileSync(join(__dirname, 'test-private.pem')).toString();
  let sigHeaders = signature.headers({ inbox, reqBody, privateKey, keyId: mockActor.id });

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
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('401 Signature Validation Failed'));
  });

  test('inbox should accept signature validation', async () => {
    // push these into process.env to be picked up by request object headers
    for (const key of Object.keys(sigHeaders)) {
      process.env[`http_${key}`] = sigHeaders[key];
    }
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: reqBody,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('200 OK'));
  });

  test('inbox should fail if unable to fetch the actor', async () => {
    // push these into process.env to be picked up by request object headers
    for (const key of Object.keys(sigHeaders)) {
      process.env[`http_${key}`] = sigHeaders[key];
    }
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/inbox';

    const body = JSON.stringify({ ...data, actor: 'unacceptable_url' });
    sigHeaders = signature.headers({ inbox, reqBody: body, privateKey, keyId: mockActor.id });
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: body,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.match(headers.status, new RegExp('406 Not Acceptable - Unable to Fetch Actor'));
  });

});


