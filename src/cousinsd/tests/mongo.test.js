import fs from 'node:fs';
import dotenv from 'dotenv';
import { suite, test, before, after } from "node:test";
import assert from "node:assert/strict";

import Mongo from '../lib/mongo.js';

dotenv.config();

suite("Mongo sanity tests", async () => {

  let mongo;

  before(() => {
    console.log('suite start');
    mongo = new Mongo(process.env.MONGO_URI);
  });

  after(() => {
    console.log('suite end');
    mongo.close();
  });

  test('simple first', () => {
    assert.strictEqual(1, 1);
  });
}
