
import { MongoClient } from 'mongodb';

class Mongo {

  client = null;

  constructor(mongo_uri) {
    this.client = new MongoClient(mongo_uri);
  }

  async findOne(collection, query, options) {
    return await this.client.db().collection(collection).findOne(query, options);
  }

  async findMany(collection, query, options) {
    return await this.client.db().collection(collection).find(query, options).toArray();
  }

  async insertOne(collection, doc) {
    return await this.client.db().collection(collection).insertOne(doc);
  }

  async close() {
    await this.client.close();
  }
}

export default Mongo;
