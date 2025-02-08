import fs from 'node:fs';
import crypto from 'node:crypto';
import html from './template.js';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (req, res, opts) => {
  const { actor, mongo, content_type, filename } = opts;
  let data;
  let body;

  if (filename === 'index' || filename === '') {
    data = await mongo.findOne('actor', { id: actor })
  } else if (['inbox', 'outbox', 'messages'].includes(filename)) {
    data = await mongo.findMany(filename, {})
  } else {
    data = await mongo.findOne(filename, { actor })
  }

  if (fs.existsSync(join(__dirname, `${filename}.${content_type}.js`))) {
    body = await import(join(__dirname, `${filename}.${content_type}.js`))
      .then(async ({ default: fn }) => await fn(data));
  }

  if (typeof body === 'undefined') body = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  switch (content_type) {
    case 'html':
      const guid = crypto.randomBytes(16).toString('hex');
      await mongo.updateOne('tokens', { name: process.env.NAME }, { '$set': { name: process.env.NAME, token: guid }});
      res.write(html({
        title: `${process.env.NAME} - ${filename}`,
        body,
        guid,
      }));
      break;
    case 'json':
      res.write(data);
      break;
    default:
      throw new Error('Content type is not valid');
  }
}
