import fs from 'node:fs';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';

import Logger from '../lib/logger.js';

suite("Logger sanity tests", async () => {

  let logger;
  let server = {};

  before(() => {
    
    for (let name in process.env) {
      let value = process.env[name];
      name = name.toLowerCase();
      if (name.indexOf('http_') === 0) {
        server[ name.substring('http_'.length) ] = value;
      } else {
        server[name] = value;
      }
    }
    logger = new Logger(server);
  });

  after(() => {
    logger.close(); // closes any open files
    fs.unlinkSync(`${logger.logPath}/access.log`);
    fs.unlinkSync(`${logger.logPath}/app.log`);
    fs.unlinkSync(`${logger.logPath}/error.log`);
  });

  test('access string should contain request_method, request_uri, remote_addr, and user_agent as log prefix', () => {
    assert.strictEqual(logger.access_string, ' GET /cousinsd/index 222.222.222.222 node-test');
  });

  test('server string should contain only request_method, request_uri as log prefix', () => {
    assert.strictEqual(logger.server_string, ' GET /cousinsd/index');
  });

  test('should return NZ locale date time as log date string', () => {
    assert.strictEqual(typeof logger.formatDatetime(), 'string');
  });

  test('should log the message and server attributes correctly to file', () => {
    const message = 'Some random log data';
    logger.app(message);
    const data = fs.readFileSync(`${logger.logPath}/app.log`);
    const logString = data.toString();
    assert.match(logString, new RegExp(message));
    for (const key of ['request_method', 'request_uri']) {
      assert.match(logString, new RegExp(server[key]));
    }
  });

  test('should log json object correctly to file', () => {
    const message = { my: 'object', as: 'json'};
    logger.app(message);
    const data = fs.readFileSync(`${logger.logPath}/app.log`);
    const logString = data.toString();
    assert.match(logString, new RegExp(message));
    for (const str of ['my', 'object']) {
      assert.match(logString, new RegExp(str));
    }
  });

  test('should log error object correctly to file', () => {
    const message = new Error('my message');
    logger.error(message);
    const data = fs.readFileSync(`${logger.logPath}/error.log`);
    const logString = data.toString();
    assert.match(logString, new RegExp(message));
    for (const str of [message, 'Error']) {
      assert.match(logString, new RegExp(str));
    }
  });

  test('should only log date and server attributes correctly to file', () => {
    logger.access();
    const data = fs.readFileSync(`${logger.logPath}/access.log`);
    const logString = data.toString();
    for (const key of ['remote_addr', 'request_method']) {
      assert.match(logString, new RegExp(server[key]));
    }
  });
});

