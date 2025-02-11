
import { MongoClient, ObjectId } from 'mongodb';

class Mongo {

  client = null;

  constructor(mongo_uri) {
    this.client = new MongoClient(mongo_uri);
  }

  async findOne(collection, query, options) {
    if (Object.hasOwnProperty.call(query, '_id')) {
      query._id = new ObjectId(query._id);
    }
    return await this.client.db().collection(collection).findOne(query, options);
  }

  async findMany(collection, query, options) {
    return await this.client.db().collection(collection).find(query, options).toArray();
  }

  async updateOne(collection, query, doc) {
    if (Object.hasOwnProperty.call(query, '_id')) {
      query._id = new ObjectId(query._id);
    }
    return await this.client.db().collection(collection).updateOne(query, doc, { upsert: true });
  }

  async insertOne(collection, doc) {
    return await this.client.db().collection(collection).insertOne(doc);
  }

  async deleteOne(collection, query) {
    if (Object.hasOwnProperty.call(query, '_id')) {
      query._id = new ObjectId(query._id);
    }
    return await this.client.db().collection(collection).deleteOne(query);
  }

  async close() {
    await this.client.close();
  }
}

export default Mongo;
