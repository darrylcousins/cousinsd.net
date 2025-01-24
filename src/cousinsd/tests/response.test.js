import { Worker } from 'node:worker_threads';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import Response from '../lib/response.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

suite('Response sanity tests', async () => {

  before(() => {
  });

  after(async () => {
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
  const mockResponse = async (data) => {
    return new Promise((resolve, reject) => {
      let output = '';
      const worker = new Worker(join(__dirname, 'mock.response.js'), {
        stdout: true,
        workerData: data,
      });
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

  /*
   * Headers should one per line followed by a new and empty line
   * and should include status and content-type
   */
  test('send and assert headers', async () => {
    const output = await mockResponse({
      method: 'sendHeaders',
      data: null,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    assert.ok(Object.keys(headers).includes('status'));
    assert.ok(Object.keys(headers).includes('content-type'));
    // default status is 200 OK
    assert.strictEqual(headers.status, '200 OK');
  });

  /*
   * Response has a write method
   */
  test('write string', async () => {
    const text = 'some data to write';
    const output = await mockResponse({
      method: 'write',
      data: text,
    });
    const parts = output.split('\n');
    // last line of output should the text
    assert.strictEqual(parts[parts.length - 1], text);
    // always a new and empty line after header lines and before text
    assert.strictEqual(parts[parts.length - 2], '');
  });

  /*
   * Response write method will convert objects as json strings
   * NB cannot pass object via argv so the test fudges this in the mock-response
   */
  test('write json', async () => {
    const obj = {data: "some object"};
    const output = await mockResponse({
      method: 'write',
      data: obj,
    });
    const parts = output.split('\n\n');
    const json2 = parts[1].replaceAll('\n', '');
    const obj2 = JSON.parse(json2);
    assert.strictEqual(obj2.data, obj.data);
  });

  /*
   * Response has an `end` method that sends headers
   */
  test('end response', async () => {
    const output = await mockResponse({
      method: 'end',
      data: null,
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    // default status is 200 OK
    assert.strictEqual(headers.status, '200 OK');
  });

  /*
   * A different status can be sent on `end`
   */
  test('end response with status', async () => {
    const output = await mockResponse({
      method: 'end',
      data: '500 Server Error',
    });
    const parts = output.split('\n');
    const headers = headerStringToObject(parts);
    // default status is 200 OK
    assert.strictEqual(headers.status, '500 Server Error');
  });

  /*
   * Headers are sent once only but `write` can be called as often as required
   */
  test('send headers only once', async () => {
    const arr = ['line one\n', 'line two\n', 'line 3\n'];
    const output = await mockResponse({
      method: 'end',
      data: arr,
    });
    const parts = output.split('\n\n');
    assert.strictEqual(parts[1], arr.join(''));
  });

});

