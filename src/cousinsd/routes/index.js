
import Mongo from '../lib/mongo.js';

export default async (req, res, opts) => {
  const { actor, mongo } = opts;
  res.write(await mongo.findOne('actors', {
    id: actor
  }));
}
