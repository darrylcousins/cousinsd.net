import { suite, test, before, after } from "node:test";
import assert from "node:assert/strict";
import Mongo from '../lib/mongo.js';

suite("Mongo sanity tests", async () => {

  let mongo;
  const tableName = 'test_table';

  before(() => {
    mongo = new Mongo(process.env.MONGO_URI);
  });

  after(async () => {
    await mongo.client.db().collection(tableName).drop();
    await mongo.close();
  });

  test('simple insert', async () => {
    const result = await mongo.insertOne(tableName, { data: 'my test' });
    assert.ok(result.acknowledged); // probaly best to look at the insertedId
  });

  test('simple find one', async () => {
    const result = await mongo.findOne(tableName, { data: 'my test' });
    assert.strictEqual(result.data, 'my test');
  });

  test('simple find many', async () => {
    const result = await mongo.findMany(tableName, {});
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].data, 'my test');
  });
});
