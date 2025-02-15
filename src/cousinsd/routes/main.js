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

  if (filename === 'home' || filename === 'index' || filename === '') {
    data = await mongo.findOne('actor', { id: actor })
  } else {
    data = await mongo.findMany(filename)
  }
  data.actor = actor;

  if (fs.existsSync(join(__dirname, `${filename}.${content_type}.js`))) {
    body = await import(join(__dirname, `${filename}.${content_type}.js`))
      .then(async ({ default: fn }) => await fn(req, res, data));
  }

  switch (content_type) {
    case 'html':
      if (typeof body === 'undefined') body = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      const guid = crypto.randomBytes(16).toString('hex');
      await mongo.updateOne('tokens', { name: req.env.name }, { '$set': { name: req.env.name, token: guid }});
      res.write(html({
        title: `@${req.env.name} - ${filename}`,
        body,
        guid,
        env: req.env
      }));
      break;
    case 'json':
      if (typeof body === 'undefined') body = data;
      res.write(body);
      break;
    default:
      throw new Error('Content type is not valid');
  }
}
