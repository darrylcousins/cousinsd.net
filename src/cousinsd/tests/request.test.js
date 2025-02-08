import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import Request from '../lib/request.js';

suite("Request sanity tests", async () => {

  let request;

  before(() => {
    request = new Request();
  });

  after(async () => {
  });

  test('env values should be in either headers or server objects', async () => {
    for (let name in process.env) {
      let value = process.env[name];
      name = name.toLowerCase();
      if (name.indexOf('http_') === 0) {
        name = name.substring('http_'.length);
        assert.ok(Object.keys(request.headers).includes(name));
      } else {
        assert.ok(Object.keys(request.env).includes(name));
      }
    }
  });

  /* Forcing server to manage this situation
  test('should have filename as index if directory requested', async () => {
    let request2 = new Request({ REQUEST_URI: "/cousinsd" });
    assert.strictEqual(request2.filename, 'index');
  });
  */

});

