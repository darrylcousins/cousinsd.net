import html from './template.js';

export default async (req, res) => {
  res.write(html({
    title: `404 Not found: ${req.filename}`,
    body: ``,
    env: req.env
  }));
}

