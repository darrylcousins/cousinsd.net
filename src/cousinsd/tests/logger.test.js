import fs from 'node:fs';
import dotenv from 'dotenv';
import { suite, test, before, after } from "node:test";
import assert from "node:assert/strict";

import Logger from '../lib/logger.js';

dotenv.config();

suite("Logger sanity tests", async () => {
  let logger;
  let server;
  before(() => {
    server = {
      request_method: 'GET',
      request_uri: 'cousinsd.net/cousinsd',
      remote_addr: '222.222.222.222',
      user_agent: 'node-test'
    };
    logger = new Logger(server);
  });

  after(() => {
    logger.close(); // closes any open files
    fs.unlinkSync(`${logger.logPath}/access.log`);
    fs.unlinkSync(`${logger.logPath}/app.log`);
  });

  test('access string should contain request_method, request_uri, remote_addr, and user_agent as log prefix', () => {
    assert.strictEqual(logger.access_string, ' GET cousinsd.net/cousinsd 222.222.222.222 node-test');
  });

  test('server string should contain only request_method, request_uri as log prefix', () => {
    assert.strictEqual(logger.server_string, ' GET cousinsd.net/cousinsd');
  });

  test('should return NZ locale date time as log date string', () => {
    assert.strictEqual(typeof logger.formatDatetime(), 'string');
  });

  test('should log the message and server attributes correctly to file', () => {
    const message = 'Some random log data';
    logger.app(message);
    const data = fs.readFileSync(`${logger.logPath}/app.log`);
    const logString = data.toString();
    console.log(logString);
    assert.match(logString, new RegExp(message));
    for (const key of ['request_method', 'request_uri']) {
      assert.match(logString, new RegExp(server[key]));
    }
  });

  test('should only log date and server attributes correctly to file', () => {
    logger.access();
    const data = fs.readFileSync(`${logger.logPath}/access.log`);
    const logString = data.toString();
    console.log(logString);
    for (const key of Object.keys(server)) {
      assert.match(logString, new RegExp(server[key]));
    }
  });
});

